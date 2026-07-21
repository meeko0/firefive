from flask import Blueprint, g, jsonify, request
from sqlalchemy import or_
from app.models.listing import Listing
from app.models.favorite import Favorite
from app.models.review import Review
from app.database import db
from app.security import require_auth

listings_bp = Blueprint("listings", __name__)

@listings_bp.route("/api/listings", methods=["GET"])
def get_listings():
    query = Listing.query
    search = request.args.get("search", "").strip()
    housing_type = request.args.get("type", "").strip()
    min_price = request.args.get("minPrice", type=int)
    max_price = request.args.get("maxPrice", type=int)
    bedrooms = request.args.get("bedrooms", type=int)
    amenity = request.args.get("amenity", "").strip().lower()

    if search:
        query = query.filter(or_(Listing.name.ilike(f"%{search}%"), Listing.address.ilike(f"%{search}%")))
    if housing_type and housing_type != "all":
        query = query.filter_by(housing_type=housing_type)
    if min_price is not None:
        query = query.filter(or_(Listing.rent_max >= min_price, Listing.price_per_semester >= min_price))
    if max_price is not None:
        query = query.filter(or_(Listing.rent_min <= max_price, Listing.price_per_semester <= max_price))
    if bedrooms is not None:
        query = query.filter(Listing.bedrooms >= bedrooms)
    if amenity:
        query = query.filter(Listing.amenities.ilike(f"%{amenity}%"))

    listings = query.order_by(Listing.id).all()
    return jsonify([listing.to_dict() for listing in listings])


@listings_bp.route("/api/listings/<int:listing_id>", methods=["GET"])
def get_listing(listing_id):
    listing = db.get_or_404(Listing, listing_id)
    sort = request.args.get("sort", "relevant")
    review_query = Review.query.filter_by(listing_id=listing.id, status="approved")
    if sort == "newest":
        review_query = review_query.order_by(Review.created_at.desc())
    elif sort == "highest":
        review_query = review_query.order_by(Review.rating.desc())
    elif sort == "lowest":
        review_query = review_query.order_by(Review.rating.asc())
    else:
        review_query = review_query.order_by(Review.rating.desc(), Review.created_at.desc())
    reviews = review_query.all()
    data = listing.to_dict()
    data["reviews"] = [review.to_dict() for review in reviews]
    data["averageRating"] = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else listing.rating
    data["averageSafetyRating"] = round(sum(r.safety_rating for r in reviews) / len(reviews), 1) if reviews else None
    data["reviewCount"] = len(reviews) if reviews else listing.review_count
    return jsonify(data)


@listings_bp.route("/api/favorites", methods=["GET"])
@require_auth()
def get_favorites():
    favorites = Favorite.query.filter_by(user_id=g.current_user.id).all()
    return jsonify([favorite.listing.to_dict() for favorite in favorites])


@listings_bp.route("/api/favorites/<int:listing_id>", methods=["POST"])
@require_auth()
def add_favorite(listing_id):
    db.get_or_404(Listing, listing_id)
    if db.session.get(Favorite, (g.current_user.id, listing_id)) is None:
        db.session.add(Favorite(user_id=g.current_user.id, listing_id=listing_id))
        db.session.commit()
    return jsonify({"listingId": listing_id, "favorited": True}), 201


@listings_bp.route("/api/favorites/<int:listing_id>", methods=["DELETE"])
@require_auth()
def remove_favorite(listing_id):
    Favorite.query.filter_by(user_id=g.current_user.id, listing_id=listing_id).delete()
    db.session.commit()
    return "", 204
