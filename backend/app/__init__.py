from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import Config

# Initialize extensions
mongo = PyMongo()
jwt = JWTManager()
mail = Mail()

def create_app(config_class=Config):
    """Flask application factory."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # --- CORS setup for React frontend with credentials (JWT) ---
    CORS(
        app,
        supports_credentials=True,  # allows cookies or headers with auth
        resources={r"/api/*": {"origins": "http://localhost:3000"}},
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # === Register Blueprints ===
    from app.routes.auth import auth_bp
    from app.routes.jobs import jobs_bp
    from app.routes.applications import applications_bp
    from app.routes.matches import matches_bp
    from app.routes.notifications import notifications_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(matches_bp, url_prefix="/api/matches")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # === Health Check Route ===
    @app.route("/")
    def home():
        return "✅ SmartMatch API is running successfully!"

    return app
