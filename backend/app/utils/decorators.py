# backend/app/utils/decorators.py
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from app.models.user import User

def jobseeker_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID'}), 403

        user = User.find_by_id(user_obj_id)
        if not user or user.get('role') != 'jobseeker':
            return jsonify({'error': 'Jobseeker access required'}), 403

        return f(*args, **kwargs)

    return decorated_function


def employer_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID'}), 403

        user = User.find_by_id(user_obj_id)
        if not user or user.get('role') != 'employer':
            return jsonify({'error': 'Employer access required'}), 403

        # Ensure verified (optional: remove during testing)
        if not user.get('verified', False):
            return jsonify({'error': 'Employer account not verified'}), 403

        return f(*args, **kwargs)

    return decorated_function


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        try:
            user_obj_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID'}), 403

        user = User.find_by_id(user_obj_id)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        return f(*args, **kwargs)

    return decorated_function
