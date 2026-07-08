from flask import Blueprint, jsonify
from app.models.listing import Listing

listings_bp = Blueprint("listings", __name__)

@listings_bp.route("/api/listings", methods=["GET"])
def get_listings():
    listings = Listing.query.all()
    return jsonify([
        {"id": l.id, "name": l.name, "address": l.address, "description": l.description}
        for l in listings
    ])
