import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///pantherden.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv("SECRET_KEY", "pantherden-local-development-secret-change-me")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@gsu.edu").lower()
    MODERATOR_EMAIL = os.getenv("MODERATOR_EMAIL", "moderator@gsu.edu").lower()
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_FROM = os.getenv("SMTP_FROM", "PantherDen <no-reply@pantherden.local>")
