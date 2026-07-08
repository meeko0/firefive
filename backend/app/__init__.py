from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    from app.routes.listings import listings_bp
    app.register_blueprint(listings_bp)

    with app.app_context():
        db.create_all()

    return app
