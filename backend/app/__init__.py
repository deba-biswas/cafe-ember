import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.routes.order_routes import order_bp
from app.routes.auth_routes import auth_bp
from app.routes.menu_routes import menu_bp
from app.routes.analytics_routes import analytics_bp
from app.utils.db import db
from werkzeug.security import generate_password_hash
import datetime
from config import Config
from app.utils.socket import socketio

jwt = JWTManager()


# Ensure a default admin account exists in the database
def ensure_admin_exists():
    existing_admin = db.users.find_one({"role": "admin"})

    if not existing_admin:
        print("No admin found. Creating default admin account...")

        db.users.insert_one({
            "username": "superadmin",
            "password": generate_password_hash("admin123"),
            "role": "admin",
            "created_at": datetime.datetime.utcnow()
        })

        print("Default admin account created successfully.")


# Application factory function
def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app)
    jwt.init_app(app)
    socketio.init_app(app)

    # Ensure admin user exists
    ensure_admin_exists()

    # Register API blueprints
    app.register_blueprint(order_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(analytics_bp)

    # Serve uploaded images from static directory
    @app.route('/static/uploads/<path:filename>')
    def serve_uploaded_image(filename):
        upload_dir = os.path.join(app.root_path, 'static', 'uploads')
        return send_from_directory(upload_dir, filename)

    return app