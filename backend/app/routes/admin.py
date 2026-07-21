from flask import Blueprint, jsonify, request

from app.database import db
from app.models.listing import Listing
from app.models.review import Review
from app.models.user import User
from app.security import require_auth
from app.mail import send_email


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def optional_number(value):
    return None if value in (None, "") else value


@admin_bp.route("/dashboard", methods=["GET"])
@require_auth(staff=True)
def dashboard():
    return jsonify({
        "counts": {"users": User.query.count(), "reviews": Review.query.count(), "properties": Listing.query.count()},
        "pendingReviews": [review.to_dict() for review in Review.query.filter_by(status="pending").order_by(Review.created_at).all()],
        "users": [{"id": user.id, "name": user.name, "email": user.email, "isVerified": user.is_verified, "role": "admin" if user.is_admin else "moderator" if user.is_moderator else "student"} for user in User.query.order_by(User.created_at.desc()).all()],
        "properties": [listing.to_dict() for listing in Listing.query.order_by(Listing.name).all()],
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
        distance_mi=data.get("distanceMi"),
        bedrooms=data.get("bedrooms"),
        amenities=",".join(data.get("amenities", [])),
        photo_url=str(data.get("photoUrl", "")) or "/property-placeholder.svg",
        parking_cost=optional_number(data.get("parkingCost")),
        insurance_cost=optional_number(data.get("insuranceCost")),
        average_utilities=optional_number(data.get("averageUtilities")),
        rating=0,
        review_count=0,
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify({"listing": listing.to_dict()}), 201


@admin_bp.route("/properties/<int:listing_id>", methods=["PATCH"])
@require_auth(staff=True)
def update_property(listing_id):
    listing = db.get_or_404(Listing, listing_id)
    data = request.get_json(silent=True) or {}
    housing_type = str(data.get("type", listing.housing_type)).strip()
    if housing_type not in ("apartment", "dorm"):
        return jsonify({"error": "Choose apartment or dorm."}), 400
    bedrooms = data.get("bedrooms", listing.bedrooms)
    try:
        bedrooms = int(bedrooms) if bedrooms not in (None, "") else None
    except (TypeError, ValueError):
        return jsonify({"error": "Bedrooms must be a whole number."}), 400
    if bedrooms is not None and bedrooms < 1:
        return jsonify({"error": "Bedrooms must be at least 1."}), 400

    listing.name = str(data.get("name", listing.name)).strip()
    listing.address = str(data.get("address", listing.address)).strip()
    listing.description = str(data.get("description", listing.description or "")).strip()
    listing.housing_type = housing_type
    listing.bedrooms = bedrooms
    listing.rent_min = data.get("rentMin", listing.rent_min) or None
    listing.rent_max = data.get("rentMax", listing.rent_max) or None
    listing.price_per_semester = data.get("pricePerSemester", listing.price_per_semester) or None
    listing.distance_mi = data.get("distanceMi", listing.distance_mi) or None
    listing.amenities = ",".join(data.get("amenities", listing.to_dict()["amenities"]))
    listing.photo_url = str(data.get("photoUrl", listing.photo_url or "/property-placeholder.svg"))
    listing.parking_cost = optional_number(data.get("parkingCost", listing.parking_cost))
    listing.insurance_cost = optional_number(data.get("insuranceCost", listing.insurance_cost))
    listing.average_utilities = optional_number(data.get("averageUtilities", listing.average_utilities))
    db.session.commit()
    return jsonify({"listing": listing.to_dict()})
