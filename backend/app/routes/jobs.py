# backend/app/routes/jobs.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.job import Job
from app.models.user import User
from app.utils.decorators import employer_required, admin_required

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('', methods=['GET'])
def get_jobs():
    # Get query parameters
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    location = request.args.get('location')
    remote = request.args.get('remote')
    skills = request.args.getlist('skills')
    search = request.args.get('search')
    
    # Build filters
    filters = {}
    if location:
        filters['location'] = location
    if remote is not None:
        filters['remote'] = remote.lower() == 'true'
    if skills:
        filters['skills'] = skills
    
    # Get jobs
    if search:
        jobs = Job.search(search, limit, skip)
    else:
        jobs = Job.find_all(filters, limit, skip)
    
    # Format jobs for response
    for job in jobs:
        job['_id'] = str(job['_id'])
        job['employer_id'] = str(job['employer_id'])
    
    return jsonify(jobs), 200

@jobs_bp.route('/<job_id>', methods=['GET'])
def get_job(job_id):
    job = Job.find_by_id(job_id)
    
    if not job or not job.get('active', True):
        return jsonify({'error': 'Job not found'}), 404
    
    # Format job for response
    job['_id'] = str(job['_id'])
    job['employer_id'] = str(job['employer_id'])
    
    return jsonify(job), 200

@jobs_bp.route('', methods=['POST'])
@jwt_required()
@employer_required
def create_job():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['title', 'description', 'required_skills', 'location', 'salary_range']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create job
    job_id = Job.create(data, user_id)
    
    # Add job to employer's jobs list
    User.collection.update_one(
        {'_id': user_id},
        {'$push': {'jobs': job_id}}
    )
    
    return jsonify({
        'message': 'Job created successfully',
        'job_id': job_id
    }), 201

@jobs_bp.route('/<job_id>', methods=['PUT'])
@jwt_required()
@employer_required
def update_job(job_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Check if job exists and belongs to the employer
    job = Job.find_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    if job['employer_id'] != user_id:
        return jsonify({'error': 'Unauthorized to update this job'}), 403
    
    # Update job
    success = Job.update(job_id, data)
    
    if not success:
        return jsonify({'error': 'Failed to update job'}), 500
    
    return jsonify({'message': 'Job updated successfully'}), 200

@jobs_bp.route('/<job_id>', methods=['DELETE'])
@jwt_required()
@employer_required
def delete_job(job_id):
    user_id = get_jwt_identity()
    
    # Check if job exists and belongs to the employer
    job = Job.find_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    if job['employer_id'] != user_id:
        return jsonify({'error': 'Unauthorized to delete this job'}), 403
    
    # Delete job (soft delete)
    success = Job.delete(job_id)
    
    if not success:
        return jsonify({'error': 'Failed to delete job'}), 500
    
    return jsonify({'message': 'Job deleted successfully'}), 200