# backend/app/routes/applications.py
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from bson import ObjectId
import os
from flask import send_file
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.models.notification import Notification
from app.utils.decorators import employer_required, jobseeker_required
from app.services.file_service import save_uploaded_file
from ..services.matching_service import MatchingService

applications_bp = Blueprint('applications', __name__)


# ---------------- APPLY TO JOB ----------------
@applications_bp.route('/<job_id>', methods=['POST'])
@jwt_required()
@jobseeker_required
def apply_to_job(job_id):
    jobseeker_id = get_jwt_identity()
    job = Job.find_by_id(job_id)

    if not job or not job.get('active', True):
        return jsonify({'error': 'Job not found or inactive'}), 404

    if Application.has_applied(jobseeker_id, job_id):
        return jsonify({'error': 'Already applied to this job'}), 409

    cover_letter = request.form.get('cover_letter', '')
    resume_file = request.files.get('resume')
    user = User.find_by_id(jobseeker_id)

    if resume_file:
        resume_url = save_uploaded_file(resume_file, 'resumes')
        if not resume_url:
            return jsonify({'error': 'Failed to upload resume'}), 500
        User.collection.update_one({'_id': ObjectId(jobseeker_id)}, {'$set': {'resume_url': resume_url}})
    else:
        if not user.get('resume_url'):
            return jsonify({'error': 'Resume file is required'}), 400
        resume_url = user['resume_url']

    application_data = {
        'jobseeker_id': jobseeker_id,
        'job_id': job_id,
        'employer_id': job['employer_id'],
        'resume_url': resume_url,
        'cover_letter': cover_letter
    }

    application_id = Application.create(application_data)

    User.collection.update_one({'_id': ObjectId(jobseeker_id)}, {'$push': {'applications': application_id}})

    Notification.create({
        'recipient_id': job['employer_id'],
        'type': 'new_application',
        'title': f'New application for {job["title"]}',
        'message': f'{user["name"]} has applied to your job posting.',
        'related_id': application_id,
        'read': False
    })

    return jsonify({'message': 'Application submitted successfully', 'application_id': str(application_id)}), 201


# ---------------- GET JOBSEEKER APPLICATIONS ----------------
@applications_bp.route('/my-applications', methods=['GET'])
@jwt_required()
@jobseeker_required
def get_my_applications():
    jobseeker_id = get_jwt_identity()
    applications = Application.find_by_jobseeker(jobseeker_id)

    for app in applications:
        app['_id'] = str(app['_id'])
        job = Job.find_by_id(app['job_id'])
        if job:
            app['job_title'] = job['title']
            employer = User.find_by_id(job['employer_id'])
            app['company_name'] = employer.get('company_name', '') if employer else ''

    return jsonify(applications), 200


# ---------------- GET APPLICATIONS FOR A JOB (EMPLOYER) ----------------
@applications_bp.route('/job/<job_id>', methods=['GET'])
@jwt_required()
@employer_required
def get_job_applications(job_id):
    employer_id = get_jwt_identity()
    job = Job.find_by_id(job_id)

    if not job:
        return jsonify({'error': 'Job not found'}), 404
    if job['employer_id'] != employer_id:
        return jsonify({'error': 'Unauthorized'}), 403

    applications = Application.find_by_job(job_id)
    for app in applications:
        app['_id'] = str(app['_id'])
        jobseeker = User.find_by_id(app['jobseeker_id'])
        if jobseeker:
            app['jobseeker_name'] = jobseeker.get('name', '')
            app['jobseeker_email'] = jobseeker.get('email', '')
            app['jobseeker_location'] = jobseeker.get('location', '')
            app['jobseeker_skills'] = jobseeker.get('skills', [])

    return jsonify(applications), 200


# ---------------- UPDATE APPLICATION STATUS ----------------
@applications_bp.route('/<application_id>/status', methods=['PUT'])
@jwt_required()
@employer_required
def update_application_status(application_id):
    employer_id = get_jwt_identity()
    application = Application.find_by_id(application_id)

    if not application:
        return jsonify({'error': 'Application not found'}), 404

    job = Job.find_by_id(application['job_id'])
    if not job or job['employer_id'] != employer_id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400

    status = data['status']
    notes = data.get('notes', '')

    valid_statuses = ['Applied', 'Under Review', 'Interview', 'Hired', 'Rejected']
    if status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

    success = Application.update_status(application_id, status, notes)
    if not success:
        return jsonify({'error': 'Failed to update status'}), 500

    Notification.create({
        'recipient_id': application['jobseeker_id'],
        'type': 'application_status_change',
        'title': 'Application status updated',
        'message': f'Your application for {job["title"]} has been updated to: {status}',
        'related_id': application_id,
        'read': False
    })

    return jsonify({'message': 'Application status updated successfully'}), 200


# ---------------- GET MATCH SCORE FOR A JOB ----------------
@applications_bp.route('/matches/job/<job_id>', methods=['GET'])
@jwt_required()
@jobseeker_required
def get_job_match(job_id):
    jobseeker_id = get_jwt_identity()
    job = Job.find_by_id(job_id)

    if not job or not job.get('active', True):
        return jsonify({'error': 'Job not found or inactive'}), 404

    match_data = MatchingService.calculate_match(jobseeker_id, job_id)
    if not match_data:
        return jsonify({'error': 'No match data available'}), 404

    return jsonify(match_data), 200


@applications_bp.route('/matches/job/<job_id>/all', methods=['GET'])
@jwt_required()
@employer_required
def get_job_matches_for_employer(job_id):
    employer_id = get_jwt_identity()
    job = Job.find_by_id(job_id)

    if not job or job['employer_id'] != employer_id:
        return jsonify({'error': 'Unauthorized or job not found'}), 403

    applications = Application.find_by_job(job_id)
    matches = []

    for app in applications:
        match_data = MatchingService.calculate_match(app['jobseeker_id'], job_id)
        if match_data:
            user = User.find_by_id(app['jobseeker_id'])
            matches.append({
                'application_id': str(app['_id']),
                'jobseeker_id': app['jobseeker_id'],
                'jobseeker_name': user.get('name', '') if user else '',
                'overall_score': match_data['overall_score'],
                'breakdown': match_data['breakdown']
            })

    return jsonify(matches), 200



# ---------------- GET SINGLE APPLICATION ----------------
@applications_bp.route('/application/<application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    application = Application.find_by_id(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    user_id = get_jwt_identity()
    if application['jobseeker_id'] != user_id and application['employer_id'] != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    jobseeker = User.find_by_id(application['jobseeker_id'])
    if jobseeker:
        application['jobseeker_name'] = jobseeker.get('name', '')
        application['jobseeker_email'] = jobseeker.get('email', '')
        application['jobseeker_location'] = jobseeker.get('location', '')
        application['jobseeker_skills'] = jobseeker.get('skills', [])
        application['jobseeker_experience'] = jobseeker.get('experience', 0)

    application['_id'] = str(application['_id'])
    return jsonify(application), 200


# ---------------- DOWNLOAD RESUME ----------------


@applications_bp.route('/resumes/<path:filename>', methods=['GET'])
def download_resume(filename):
    try:
        # Normalize filename (replace backslashes and get only basename)
        safe_name = os.path.basename(filename.replace("\\", "/"))

        # Resumes folder path
        resume_folder = os.path.join(current_app.config.get('UPLOAD_FOLDER', ''), 'resumes')
        file_path = os.path.join(resume_folder, safe_name)

        # Ensure file_path is inside resume_folder
        resume_folder_abs = os.path.abspath(resume_folder)
        file_path_abs = os.path.abspath(file_path)
        if not os.path.commonpath([file_path_abs, resume_folder_abs]) == resume_folder_abs:
            return jsonify({'error': 'Invalid file path'}), 400

        # Check existence
        if not os.path.isfile(file_path_abs):
            return jsonify({'error': 'File not found'}), 404

        # Serve file
        return send_from_directory(resume_folder_abs, safe_name, as_attachment=True)

    except Exception as e:
        current_app.logger.exception('Failed to download resume')
        return jsonify({'error': f'Failed to download resume: {str(e)}'}), 500
