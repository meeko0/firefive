from functools import wraps

import jwt
from flask import current_app, g, jsonify, request

from app.models.user import User
from app.database import db


def require_auth(admin=False, staff=False, verified=False):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            header = request.headers.get("Authorization", "")
            token = header.removeprefix("Bearer ").strip()
            try:
                payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
                user = db.session.get(User, int(payload["sub"]))
            except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
                user = None

            if user is None:
                return jsonify({"error": "Authentication required."}), 401
            if admin and not user.is_admin:
                return jsonify({"error": "Administrator access required."}), 403
            if staff and not (user.is_moderator or user.is_admin):
                return jsonify({"error": "Moderator access required."}), 403
            if verified and not user.is_verified:
                return jsonify({"error": "Verify your email before continuing."}), 403

            g.current_user = user
            return view(*args, **kwargs)
        return wrapped
    return decorator
