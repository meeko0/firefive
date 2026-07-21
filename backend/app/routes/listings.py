from flask import Blueprint, jsonify
from app.models.listing import Listing

listings_bp = Blueprint("listings", __name__)

@listings_bp.route("/api/listings", methods=["GET"])
def get_listings():
    listings = Listing.query.order_by(Listing.id).all()
    return jsonify([listing.to_dict() for listing in listings])


@listings_bp.route("/api/listings/<int:listing_id>", methods=["GET"])
def get_listing(listing_id):
    listing = Listing.query.get_or_404(listing_id)
    return jsonify(listing.to_dict())
