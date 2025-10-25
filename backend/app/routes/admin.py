# backend/app/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.utils.decorators import admin_required
from app.services.analytics_service import AnalyticsService

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_data():
    # Get basic stats
    stats = {
        'total_users': User.collection.count_documents({}),
        'total_jobseekers': User.collection.count_documents({'role': 'jobseeker'}),
        'total_employers': User.collection.count_documents({'role': 'employer'}),
        'total_jobs': Job.collection.count_documents({'active': True}),
        'total_applications': Application.collection.count_documents({}),
        'unverified_employers': User.collection.count_documents({'role': 'employer', 'verified': False})
    }
    
    return jsonify(stats), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    # Get query parameters
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    role = request.args.get('role')
    verified = request.args.get('verified')
    
    # Build query
    query = {}
    if role:
        query['role'] = role
    if verified is not None:
        query['verified'] = verified.lower() == 'true'
    
    # Get users
    users = list(User.collection.find(query).skip(skip).limit(limit))
    
    # Format users for response
    for user in users:
        user['_id'] = str(user['_id'])
        user.pop('password_hash', None)
    
    return jsonify(users), 200

@admin_bp.route('/users/<user_id>/verify', methods=['POST'])
@jwt_required()
@admin_required
def verify_user(user_id):
    # Check if user exists
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user['role'] != 'employer':
        return jsonify({'error': 'Only employers can be verified'}), 400
    
    # Update verification status
    success = User.update_profile(user_id, {'verified': True})
    
    if not success:
        return jsonify({'error': 'Failed to verify user'}), 500
    
    return jsonify({'message': 'User verified successfully'}), 200

@admin_bp.route('/users/<user_id>/suspend', methods=['POST'])
@jwt_required()
@admin_required
def suspend_user(user_id):
    # Check if user exists
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update suspension status
    success = User.update_profile(user_id, {'suspended': True})
    
    if not success:
        return jsonify({'error': 'Failed to suspend user'}), 500
    
    return jsonify({'message': 'User suspended successfully'}), 200

@admin_bp.route('/jobs', methods=['GET'])
@jwt_required()
@admin_required
def get_jobs():
    # Get query parameters
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    active = request.args.get('active')
    
    # Build query
    query = {}
    if active is not None:
        query['active'] = active.lower() == 'true'
    
    # Get jobs
    jobs = list(Job.collection.find(query).skip(skip).limit(limit))
    
    # Format jobs for response
    for job in jobs:
        job['_id'] = str(job['_id'])
        job['employer_id'] = str(job['employer_id'])
        employer = User.find_by_id(job['employer_id'])
        job['company_name'] = employer['company_name'] if employer else 'Unknown'
    
    return jsonify(jobs), 200

@admin_bp.route('/jobs/<job_id>/approve', methods=['POST'])
@jwt_required()
@admin_required
def approve_job(job_id):
    # Check if job exists
    job = Job.find_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Update approval status
    success = Job.update(job_id, {'active': True})
    
    if not success:
        return jsonify({'error': 'Failed to approve job'}), 500
    
    return jsonify({'message': 'Job approved successfully'}), 200

@admin_bp.route('/jobs/<job_id>/reject', methods=['POST'])
@jwt_required()
@admin_required
def reject_job(job_id):
    # Check if job exists
    job = Job.find_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Update approval status
    success = Job.update(job_id, {'active': False})
    
    if not success:
        return jsonify({'error': 'Failed to reject job'}), 500
    
    return jsonify({'message': 'Job rejected successfully'}), 200

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
@admin_required
def get_analytics():
    # Get query parameters
    period = request.args.get('period', 'month')  # day, week, month, year
    
    # Get analytics data
    analytics = AnalyticsService.get_platform_analytics(period)
    
    return jsonify(analytics), 200