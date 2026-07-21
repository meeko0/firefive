from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import db


def seed_listings():
    from app.models.listing import Listing

    if Listing.query.first() is not None:
        return

    listings = [
        Listing(housing_type="apartment", name="The Lofts at GSU", address="75 Piedmont Ave NE", rating=4.3, review_count=12, verified=True, rent_min=1150, rent_max=1400, distance_mi=0.4),
        Listing(housing_type="apartment", name="Auburn Ave Flats", address="210 Auburn Ave NE", rating=4.6, review_count=8, verified=True, rent_min=1300, rent_max=1650, distance_mi=0.6),
        Listing(housing_type="apartment", name="Edgewood Court", address="130 Edgewood Ave SE", rating=4.0, review_count=15, verified=True, rent_min=1050, rent_max=1300, distance_mi=0.5),
        Listing(housing_type="dorm", name="Piedmont Central", address="103 Edgewood Ave", rating=4.1, review_count=34, verified=True, price_per_semester=4400, room_type="Suite", meal_plan=True),
        Listing(housing_type="dorm", name="Piedmont North", address="141 Piedmont Ave", rating=3.9, review_count=28, verified=True, price_per_semester=3900, room_type="Double", meal_plan=True),
        Listing(housing_type="dorm", name="University Commons", address="141 Walton St NW", rating=4.3, review_count=19, verified=True, price_per_semester=4100, room_type="Apt-style", meal_plan=False),
    ]
    db.session.add_all(listings)
    db.session.commit()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    from app.routes.listings import listings_bp
    app.register_blueprint(listings_bp)

    with app.app_context():
        # Import every model before creating tables so SQLAlchemy registers them.
        from app.models.review import Review  # noqa: F401
        from app.models.user import User  # noqa: F401

        db.create_all()
        seed_listings()

    return app
