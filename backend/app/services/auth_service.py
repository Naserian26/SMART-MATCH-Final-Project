# backend/app/services/auth_service.py
from flask_jwt_extended import create_access_token, create_refresh_token
from app.models.user import User
from werkzeug.security import check_password_hash
from datetime import timedelta

class AuthService:
    @staticmethod
    def authenticate_user(email, password):
        """Authenticate user with email and password"""
        user = User.find_by_email(email)
        if user and check_password_hash(user['password_hash'], password):
            return user
        return None
    
    @staticmethod
    def generate_tokens(user_id):
        """Generate access and refresh tokens for user"""
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def register_user(user_data):
        """Register a new user"""
        # Check if user already exists
        if User.find_by_email(user_data['email']):
            return None, "Email already registered"
        
        # Create user
        user_id = User.create(user_data)
        return user_id, None