from app.database import db


class Favorite(db.Model):
    __tablename__ = "favorites"
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    listing = db.relationship("Listing")
