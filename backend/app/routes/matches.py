# backend/app/routes/matches.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.match import Match
from app.models.job import Job
from app.models.user import User
from app.services.matching_service import MatchingService
from app.utils.decorators import jobseeker_required, employer_required

matches_bp = Blueprint('matches', __name__)

@matches_bp.route('', methods=['GET'])
@jwt_required()
@jobseeker_required
def get_matches():
    jobseeker_id = get_jwt_identity()
    
    # Get query parameters
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    regenerate = request.args.get('regenerate', 'false').lower() == 'true'
    
    # Regenerate matches if requested
    if regenerate:
        matches = MatchingService.generate_matches_for_jobseeker(jobseeker_id, limit + skip)
    else:
        # Get existing matches
        matches_data = Match.find_by_user(jobseeker_id, limit, skip)
        
        # Enrich with job details
        matches = []
        for match in matches_data:
            match['_id'] = str(match['_id'])
            job = Job.find_by_id(match['job_id'])
            if job:
                match['job_title'] = job['title']
                match['company_name'] = User.find_by_id(job['employer_id'])['company_name']
                match['location'] = job['location']
                match['remote'] = job.get('remote', False)
                match['salary_range'] = job.get('salary_range', [])
                matches.append(match)
    
    return jsonify(matches), 200

@matches_bp.route('/job/<job_id>', methods=['GET'])
@jwt_required()
@employer_required
def get_job_matches(job_id):
    employer_id = get_jwt_identity()
    
    # Check if job exists and belongs to the employer
    job = Job.find_by_id(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    if job['employer_id'] != employer_id:
        return jsonify({'error': 'Unauthorized to view matches for this job'}), 403
    
    # Get query parameters
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    regenerate = request.args.get('regenerate', 'false').lower() == 'true'
    
    # Regenerate matches if requested
    if regenerate:
        matches = MatchingService.generate_matches_for_job(job_id, limit + skip)
    else:
        # Get existing matches
        matches_data = Match.find_by_job(job_id, limit, skip)
        
        # Enrich with jobseeker details
        matches = []
        for match in matches_data:
            match['_id'] = str(match['_id'])
            jobseeker = User.find_by_id(match['user_id'])
            if jobseeker:
                match['jobseeker_name'] = jobseeker['name']
                match['jobseeker_location'] = jobseeker.get('location', '')
                match['jobseeker_skills'] = jobseeker.get('skills', [])
                match['jobseeker_experience'] = jobseeker.get('experience', 0)
                matches.append(match)
    
    return jsonify(matches), 200

@matches_bp.route('/<match_id>', methods=['GET'])
@jwt_required()
def get_match(match_id):
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    # Get match
    match = Match.find_by_id(match_id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    
    # Check if user has access to this match
    if user['role'] == 'jobseeker' and match['user_id'] != user_id:
        return jsonify({'error': 'Unauthorized to view this match'}), 403
    elif user['role'] == 'employer':
        # Check if job belongs to employer
        job = Job.find_by_id(match['job_id'])
        if not job or job['employer_id'] != user_id:
            return jsonify({'error': 'Unauthorized to view this match'}), 403
    
    # Format match for response
    match['_id'] = str(match['_id'])
    
    # Add additional details based on user role
    if user['role'] == 'jobseeker':
        job = Job.find_by_id(match['job_id'])
        if job:
            match['job_title'] = job['title']
            match['company_name'] = User.find_by_id(job['employer_id'])['company_name']
            match['location'] = job['location']
            match['remote'] = job.get('remote', False)
            match['salary_range'] = job.get('salary_range', [])
    else:  # employer
        jobseeker = User.find_by_id(match['user_id'])
        if jobseeker:
            match['jobseeker_name'] = jobseeker['name']
            match['jobseeker_location'] = jobseeker.get('location', '')
            match['jobseeker_skills'] = jobseeker.get('skills', [])
            match['jobseeker_experience'] = jobseeker.get('experience', 0)
    
    return jsonify(match), 200