from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from flask import Blueprint, current_app, g, jsonify, request
from sqlalchemy.exc import IntegrityError

from app.database import db
from app.models.user import User
from app.models.favorite import Favorite
from app.models.review import Review
from app.security import require_auth
from app.mail import send_email


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def serialize_user(user):
    return {"id": user.id, "name": user.name, "email": user.email, "isVerified": user.is_verified, "isAdmin": user.is_admin, "isModerator": user.is_moderator}


def create_token(user, purpose="session", lifetime=timedelta(days=7)):
    payload = {
        "sub": str(user.id),
        "name": user.name,
        "email": user.email,
        "iat": datetime.now(timezone.utc),
        "purpose": purpose,
        "exp": datetime.now(timezone.utc) + lifetime,
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if len(name) < 2:
        return jsonify({"error": "Name must be at least 2 characters."}), 400
    if not email.endswith(".edu"):
        return jsonify({"error": "Use your university .edu email address."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        is_admin=email == current_app.config["ADMIN_EMAIL"],
        is_moderator=email == current_app.config["MODERATOR_EMAIL"],
    )
    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "An account with this email already exists."}), 409

    verification_token = create_token(user, "verify", timedelta(hours=24))
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify?token={verification_token}"
    email_sent = send_email(user.email, "Verify your PantherDen account", f"Verify your account: {verification_url}")
    return jsonify({
        "token": create_token(user),
        "user": serialize_user(user),
        "message": "Account created. Check your email to verify your account.",
        "verificationToken": verification_token if not email_sent else None,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = User.query.filter_by(email=email).first()

    if user is None or not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
        return jsonify({"error": "Incorrect email or password."}), 401

    # Allow an existing account to receive its configured staff role on next login.
    if user.email == current_app.config["ADMIN_EMAIL"] and not user.is_admin:
        user.is_admin = True
    if user.email == current_app.config["MODERATOR_EMAIL"] and not user.is_moderator:
        user.is_moderator = True
    db.session.commit()

    return jsonify({"token": create_token(user), "user": serialize_user(user)})


def decode_purpose_token(token, purpose):
    payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
    if payload.get("purpose") != purpose:
        raise jwt.InvalidTokenError
    return db.session.get(User, int(payload["sub"]))


@auth_bp.route("/verify", methods=["POST"])
def verify_email():
    token = str((request.get_json(silent=True) or {}).get("token", ""))
    try:
        user = decode_purpose_token(token, "verify")
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        user = None
    if user is None:
        return jsonify({"error": "This verification link is invalid or expired."}), 400
    user.is_verified = True
    db.session.commit()
    return jsonify({"token": create_token(user), "user": serialize_user(user), "message": "Email verified."})


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = str((request.get_json(silent=True) or {}).get("email", "")).strip().lower()
    user = User.query.filter_by(email=email).first()
    response = {"message": "If that account exists, a password reset link has been sent."}
    if user and (current_app.debug or current_app.testing):
        response["resetToken"] = create_token(user, "reset", timedelta(hours=1))
    if user:
        reset_token = create_token(user, "reset", timedelta(hours=1))
        reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}"
        email_sent = send_email(user.email, "Reset your PantherDen password", f"Reset your password: {reset_url}")
        if not email_sent:
            response["resetToken"] = reset_token
    return jsonify(response)


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    password = str(data.get("password", ""))
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400
    try:
        user = decode_purpose_token(str(data.get("token", "")), "reset")
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        user = None
    if user is None:
        return jsonify({"error": "This reset link is invalid or expired."}), 400
    user.password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db.session.commit()
    return jsonify({"message": "Password updated. You can now log in."})


@auth_bp.route("/profile", methods=["GET"])
@require_auth()
def profile():
    return jsonify({"user": serialize_user(g.current_user), "reviews": [review.to_dict() for review in g.current_user.reviews]})


@auth_bp.route("/profile", methods=["DELETE"])
@require_auth()
def delete_account():
    user = g.current_user
    Favorite.query.filter_by(user_id=user.id).delete()
    Review.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()
    return "", 204
