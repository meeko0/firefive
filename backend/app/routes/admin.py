from flask import Blueprint, jsonify, request

from app.database import db
from app.models.listing import Listing
from app.models.review import Review
from app.models.user import User
from app.security import require_auth
from app.mail import send_email


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/dashboard", methods=["GET"])
@require_auth(staff=True)
def dashboard():
    return jsonify({
        "counts": {"users": User.query.count(), "reviews": Review.query.count(), "properties": Listing.query.count()},
        "pendingReviews": [review.to_dict() for review in Review.query.filter_by(status="pending").order_by(Review.created_at).all()],
        "users": [{"id": user.id, "name": user.name, "email": user.email, "isVerified": user.is_verified, "role": "admin" if user.is_admin else "moderator" if user.is_moderator else "student"} for user in User.query.order_by(User.created_at.desc()).all()],
    })


@admin_bp.route("/reviews/<int:review_id>", methods=["PATCH"])
@require_auth(staff=True)
def moderate_review(review_id):
    review = db.get_or_404(Review, review_id)
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    reason = str(data.get("reason", "")).strip()
    if status not in ("approved", "rejected"):
        return jsonify({"error": "Choose approved or rejected."}), 400
    if status == "rejected" and not reason:
        return jsonify({"error": "A rejection reason is required."}), 400
    review.status = status
    review.rejection_reason = reason or None
    db.session.commit()
    if status == "rejected":
        send_email(review.user.email, "Update on your PantherDen review", f"Your review for {review.listing.name} was not approved. Moderator reason: {reason}")
    return jsonify({"review": review.to_dict()})


@admin_bp.route("/properties", methods=["POST"])
@require_auth(staff=True)
def add_property():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    address = str(data.get("address", "")).strip()
    housing_type = str(data.get("type", "")).strip()
    if not name or not address or housing_type not in ("apartment", "dorm"):
        return jsonify({"error": "Name, address, and a valid housing type are required."}), 400
    listing = Listing(
        name=name,
        address=address,
        housing_type=housing_type,
        description=str(data.get("description", "")).strip(),
        rent_min=data.get("rentMin"),
        rent_max=data.get("rentMax"),
        price_per_semester=data.get("pricePerSemester"),
        bedrooms=data.get("bedrooms"),
        amenities=",".join(data.get("amenities", [])),
        photo_url=str(data.get("photoUrl", "")) or "/property-placeholder.svg",
        rating=0,
        review_count=0,
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify({"listing": listing.to_dict()}), 201
