from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import db
from sqlalchemy import inspect, text


def update_sqlite_schema():
    """Add newly introduced MVP columns to databases created by earlier versions."""
    if db.engine.url.get_backend_name() != "sqlite":
        return
    additions = {
        "users": {
            "is_verified": "BOOLEAN NOT NULL DEFAULT 0",
            "is_admin": "BOOLEAN NOT NULL DEFAULT 0",
        },
        "listings": {
            "housing_type": "VARCHAR(20) NOT NULL DEFAULT 'apartment'", "rating": "FLOAT NOT NULL DEFAULT 0",
            "review_count": "INTEGER NOT NULL DEFAULT 0", "verified": "BOOLEAN NOT NULL DEFAULT 0",
            "rent_min": "INTEGER", "rent_max": "INTEGER", "distance_mi": "FLOAT", "price_per_semester": "INTEGER",
            "room_type": "VARCHAR(50)", "meal_plan": "BOOLEAN NOT NULL DEFAULT 0", "bedrooms": "INTEGER",
            "amenities": "VARCHAR(500) NOT NULL DEFAULT ''", "photo_url": "VARCHAR(500)",
        },
        "reviews": {
            "safety_rating": "INTEGER NOT NULL DEFAULT 1", "maintenance_rating": "INTEGER NOT NULL DEFAULT 1",
            "title": "VARCHAR(160) NOT NULL DEFAULT 'Student review'", "move_in_date": "DATE NOT NULL DEFAULT '2000-01-01'",
            "move_out_date": "DATE", "status": "VARCHAR(20) NOT NULL DEFAULT 'pending'", "rejection_reason": "TEXT",
        },
    }
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())
    with db.engine.begin() as connection:
        for table, columns in additions.items():
            if table not in tables:
                continue
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, definition in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {definition}"))


def seed_listings():
    from app.models.listing import Listing

    if Listing.query.first() is not None:
        return

    listings = [
        Listing(housing_type="apartment", name="The Lofts at GSU", address="75 Piedmont Ave NE", description="Modern apartments within walking distance of campus.", rating=4.3, review_count=12, verified=True, rent_min=1150, rent_max=1400, distance_mi=0.4, bedrooms=2, amenities="Parking,Gym,Laundry", photo_url="/property-placeholder.svg"),
        Listing(housing_type="apartment", name="Auburn Ave Flats", address="210 Auburn Ave NE", description="Downtown apartments near the streetcar and GSU.", rating=4.6, review_count=8, verified=True, rent_min=1300, rent_max=1650, distance_mi=0.6, bedrooms=3, amenities="Parking,Pet friendly,Pool", photo_url="/property-placeholder.svg"),
        Listing(housing_type="apartment", name="Edgewood Court", address="130 Edgewood Ave SE", description="Affordable apartments close to classrooms and transit.", rating=4.0, review_count=15, verified=True, rent_min=1050, rent_max=1300, distance_mi=0.5, bedrooms=2, amenities="Laundry,Transit", photo_url="/property-placeholder.svg"),
        Listing(housing_type="dorm", name="Piedmont Central", address="103 Edgewood Ave", description="Suite-style university housing with dining nearby.", rating=4.1, review_count=34, verified=True, price_per_semester=4400, room_type="Suite", meal_plan=True, bedrooms=1, amenities="Dining,Study rooms,Laundry", photo_url="/property-placeholder.svg"),
        Listing(housing_type="dorm", name="Piedmont North", address="141 Piedmont Ave", description="Traditional residence hall for the GSU community.", rating=3.9, review_count=28, verified=True, price_per_semester=3900, room_type="Double", meal_plan=True, bedrooms=1, amenities="Dining,Community kitchen,Laundry", photo_url="/property-placeholder.svg"),
        Listing(housing_type="dorm", name="University Commons", address="141 Walton St NW", description="Apartment-style campus living with shared common areas.", rating=4.3, review_count=19, verified=True, price_per_semester=4100, room_type="Apt-style", meal_plan=False, bedrooms=4, amenities="Study rooms,Kitchen,Laundry", photo_url="/property-placeholder.svg"),
    ]
    db.session.add_all(listings)
    db.session.commit()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    from app.routes.listings import listings_bp
    from app.routes.auth import auth_bp
    from app.routes.reviews import reviews_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(listings_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(admin_bp)

    with app.app_context():
        # Import every model before creating tables so SQLAlchemy registers them.
        from app.models.review import Review  # noqa: F401
        from app.models.user import User  # noqa: F401
        from app.models.favorite import Favorite  # noqa: F401

        db.create_all()
        update_sqlite_schema()
        seed_listings()

    return app
