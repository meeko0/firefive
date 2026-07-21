from app.database import db

class Review(db.Model):
    __tablename__ = "reviews"
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("listings.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    safety_rating = db.Column(db.Integer, nullable=False)
    maintenance_rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(160), nullable=False)
    review_text = db.Column(db.Text)
    move_in_date = db.Column(db.Date, nullable=False)
    move_out_date = db.Column(db.Date)
    status = db.Column(db.String(20), nullable=False, default="pending")
    rejection_reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    user = db.relationship("User", backref="reviews")
    listing = db.relationship("Listing", backref="reviews")

    def to_dict(self):
        return {
            "id": self.id,
            "listingId": self.listing_id,
            "listingName": self.listing.name,
            "userId": self.user_id,
            "author": self.user.name,
            "rating": self.rating,
            "safetyRating": self.safety_rating,
            "maintenanceRating": self.maintenance_rating,
            "title": self.title,
            "reviewText": self.review_text,
            "moveInDate": self.move_in_date.isoformat(),
            "moveOutDate": self.move_out_date.isoformat() if self.move_out_date else None,
            "status": self.status,
            "rejectionReason": self.rejection_reason,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
