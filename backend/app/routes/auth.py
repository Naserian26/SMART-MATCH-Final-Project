from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.validators import validate_email, validate_password
from app.utils.email_utils import send_verification_email
import uuid
from datetime import datetime, timedelta
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

# ------------------- REGISTER -------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validate input
    if not data or not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({'error': 'Missing required fields'}), 400
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    if data['role'] not in ['jobseeker', 'employer']:
        return jsonify({'error': 'Invalid role'}), 400

    # Check if user already exists
    if User.find_by_email(data['email']):
        return jsonify({'error': 'Email already registered'}), 409

    # Create user
    user_id = User.create(data)
    new_user = User.find_by_id(user_id)

    # If employer, generate verification token and send email
    if new_user['role'] == 'employer':
        token = str(uuid.uuid4())
        expiry = datetime.utcnow() + timedelta(hours=24)
        User.collection.update_one(
            {'_id': new_user['_id']},
            {'$set': {'verification_token': token, 'verification_token_expiry': expiry}}
        )
        send_verification_email(new_user['email'], token)

    # Create JWT tokens
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)

    return jsonify({
        'message': 'User registered successfully. Check your email to verify if employer.',
        'user_id': user_id,
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

# ------------------- LOGIN -------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.find_by_email(data['email'])
    if not user or not User.verify_password(user, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user['_id']))
    refresh_token = create_refresh_token(identity=str(user['_id']))

    return jsonify({
        'message': 'Login successful',
        'user_id': str(user['_id']),
        'role': user['role'],
        'verified': user.get('verified', False),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

# ------------------- CURRENT USER -------------------
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_data = dict(user)
    user_data.pop('password_hash', None)
    user_data['_id'] = str(user_data['_id'])
    return jsonify(user_data), 200

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    success = User.update_profile(user_id, data)
    if not success:
        return jsonify({'error': 'Failed to update profile'}), 500

    user = User.find_by_id(user_id)
    if user['role'] == 'jobseeker':
        User.calculate_profile_completeness(user_id)

    return jsonify({'message': 'Profile updated successfully'}), 200

# ------------------- TOKEN REFRESH -------------------
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': new_token}), 200

# ------------------- EMPLOYER VERIFICATION -------------------
@auth_bp.route('/verify-employer/<token>', methods=['GET'])
def verify_employer(token):
    user = User.collection.find_one({'verification_token': token, 'role': 'employer'})
    if not user:
        return "Invalid or expired verification link", 400

    if datetime.utcnow() > user['verification_token_expiry']:
        return "Verification link has expired", 400

    result = User.collection.update_one(
        {'_id': ObjectId(user['_id'])},
        {'$set': {'verified': True},
         '$unset': {'verification_token': "", 'verification_token_expiry': ""}}
    )

    if result.modified_count != 1:
        return "Failed to verify employer. Try again.", 500

    # Redirect to frontend login page with success query
    frontend_url = f"http://localhost:3000/login?verified=true"
    return redirect(frontend_url)
