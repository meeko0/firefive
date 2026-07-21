from app.database import db

class Listing(db.Model):
    __tablename__ = "listings"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.String(255))
    description = db.Column(db.Text)
    housing_type = db.Column(db.String(20), nullable=False)
    rating = db.Column(db.Float, nullable=False, default=0)
    review_count = db.Column(db.Integer, nullable=False, default=0)
    verified = db.Column(db.Boolean, nullable=False, default=False)
    rent_min = db.Column(db.Integer)
    rent_max = db.Column(db.Integer)
    distance_mi = db.Column(db.Float)
    price_per_semester = db.Column(db.Integer)
    room_type = db.Column(db.String(50))
    meal_plan = db.Column(db.Boolean, nullable=False, default=False)
    bedrooms = db.Column(db.Integer)
    amenities = db.Column(db.String(500), nullable=False, default="")
    photo_url = db.Column(db.String(500))

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.housing_type,
            "name": self.name,
            "address": self.address,
            "description": self.description,
            "rating": self.rating,
            "reviewCount": self.review_count,
            "verified": self.verified,
            "rentMin": self.rent_min,
            "rentMax": self.rent_max,
            "distanceMi": self.distance_mi,
            "pricePerSemester": self.price_per_semester,
            "roomType": self.room_type,
            "mealPlan": self.meal_plan,
            "bedrooms": self.bedrooms,
            "amenities": [item for item in self.amenities.split(",") if item],
            "photoUrl": self.photo_url,
        }
