from datetime import date

from flask import Blueprint, g, jsonify, request

from app.database import db
from app.models.listing import Listing
from app.models.review import Review
from app.security import require_auth


reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")


def parse_date(value):
    return date.fromisoformat(value) if value else None


@reviews_bp.route("", methods=["GET"])
def list_reviews():
    sort = request.args.get("sort", "relevant")
    query = Review.query.filter_by(status="approved")
    if sort == "newest":
        query = query.order_by(Review.created_at.desc())
    elif sort == "highest":
        query = query.order_by(Review.rating.desc(), Review.created_at.desc())
    elif sort == "lowest":
        query = query.order_by(Review.rating.asc(), Review.created_at.desc())
    else:
        query = query.order_by(Review.rating.desc(), Review.safety_rating.desc(), Review.created_at.desc())
    return jsonify([review.to_dict() for review in query.all()])


@reviews_bp.route("", methods=["POST"])
@require_auth(verified=True)
def create_review():
    data = request.get_json(silent=True) or {}
    try:
        listing_id = int(data.get("listingId"))
        rating = int(data.get("rating"))
        safety_rating = int(data.get("safetyRating"))
        maintenance_rating = int(data.get("maintenanceRating"))
        move_in_date = parse_date(data.get("moveInDate"))
        move_out_date = parse_date(data.get("moveOutDate"))
    except (TypeError, ValueError):
        return jsonify({"error": "Complete every required review field."}), 400

    title = str(data.get("title", "")).strip()
    review_text = str(data.get("reviewText", "")).strip()
    if not all(1 <= value <= 5 for value in (rating, safety_rating, maintenance_rating)):
        return jsonify({"error": "Ratings must be between 1 and 5."}), 400
    if not title or len(review_text) < 50 or move_in_date is None:
        return jsonify({"error": "Add a title, move-in date, and at least 50 characters of review text."}), 400
    if move_out_date and move_out_date < move_in_date:
        return jsonify({"error": "Move-out date cannot be before move-in date."}), 400
    db.get_or_404(Listing, listing_id)

    review = Review(
        listing_id=listing_id,
        user_id=g.current_user.id,
        rating=rating,
        safety_rating=safety_rating,
        maintenance_rating=maintenance_rating,
        title=title,
        review_text=review_text,
        move_in_date=move_in_date,
        move_out_date=move_out_date,
        status="pending",
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({"review": review.to_dict(), "message": "Review submitted for moderator approval."}), 201
