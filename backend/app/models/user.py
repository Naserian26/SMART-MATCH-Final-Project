from bson.objectid import ObjectId
from app import mongo
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User:
    collection = mongo.db.users

    @classmethod
    def create(cls, data):
        """Create a new user (jobseeker or employer)"""
        # Hash password
        data['password_hash'] = generate_password_hash(data.pop('password'))
        data['created_at'] = datetime.utcnow()
        data['last_active'] = datetime.utcnow()

        # Set default values based on role
        if data['role'] == 'jobseeker':
            data['profile_complete'] = 0
            data['applications'] = []
            data['saved_jobs'] = []
        elif data['role'] == 'employer':
            data['verified'] = False                     # Verification flag
            data['verification_token'] = None            # Token for email verification
            data['verification_token_expiry'] = None     # Expiry for the token
            data['jobs'] = []

        result = cls.collection.insert_one(data)
        return str(result.inserted_id)

    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        return cls.collection.find_one({'email': email})

    @classmethod
    def find_by_id(cls, user_id):
        """Find user by ObjectId"""
        return cls.collection.find_one({'_id': ObjectId(user_id)})

    @classmethod
    def verify_password(cls, user, password):
        """Check if provided password matches stored hash"""
        return check_password_hash(user['password_hash'], password)

    @classmethod
    def update_profile(cls, user_id, data):
        """Update user profile, including password if provided"""
        if 'password' in data:
            data['password_hash'] = generate_password_hash(data.pop('password'))

        data['last_active'] = datetime.utcnow()
        result = cls.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': data}
        )
        return result.modified_count > 0

    @classmethod
    def calculate_profile_completeness(cls, user_id):
        """Calculate jobseeker profile completeness (70% required, 30% optional)"""
        user = cls.find_by_id(user_id)
        if not user or user['role'] != 'jobseeker':
            return 0

        required_fields = [
            'name', 'location', 'skills', 'experience',
            'education', 'salary_expectation'
        ]
        optional_fields = ['resume_url', 'portfolio_links']

        completed_required = sum(1 for field in required_fields if field in user and user[field])
        completed_optional = sum(1 for field in optional_fields if field in user and user[field])

        score = (completed_required / len(required_fields)) * 70
        score += (completed_optional / len(optional_fields)) * 30

        # Update the profile_complete field
        cls.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'profile_complete': int(score)}}
        )

        return int(score)
