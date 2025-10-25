# backend/seed_data.py
from app import create_app
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.match import Match
from app.models.notification import Notification
from app.services.matching_service import MatchingService
from bson.objectid import ObjectId
import random
from datetime import datetime, timedelta

def seed_data():
    app = create_app()
    
    with app.app_context():
        print("Seeding data...")
        
        # Create admin user
        admin_data = {
            'name': 'Admin User',
            'email': 'admin@smartmatch.com',
            'password': 'admin123',
            'role': 'admin'
        }
        
        admin_id = User.create(admin_data)
        print(f"Created admin user with ID: {admin_id}")
        
        # Create employers
        employers = []
        for i in range(1, 6):
            employer_data = {
                'name': f'Employer {i}',
                'email': f'employer{i}@smartmatch.com',
                'password': 'employer123',
                'role': 'employer',
                'company_name': f'Tech Company {i}',
                'description': f'We are a leading technology company specializing in innovative solutions.',
                'website': f'https://techcompany{i}.com',
                'verified': True
            }
            
            employer_id = User.create(employer_data)
            employers.append(employer_id)
            print(f"Created employer {i} with ID: {employer_id}")
        
        # Create jobseekers
        jobseekers = []
        skills_list = [
            ['React', 'JavaScript', 'HTML', 'CSS'],
            ['Python', 'Django', 'PostgreSQL', 'Docker'],
            ['Java', 'Spring Boot', 'MySQL', 'Kubernetes'],
            ['Node.js', 'Express', 'MongoDB', 'AWS'],
            ['Angular', 'TypeScript', 'RxJS', 'NgRx'],
            ['Vue.js', 'Vuex', 'JavaScript', 'Sass'],
            ['PHP', 'Laravel', 'MySQL', 'Apache'],
            ['Ruby', 'Rails', 'PostgreSQL', 'Heroku'],
            ['C#', '.NET Core', 'SQL Server', 'Azure'],
            ['Go', 'Docker', 'Kubernetes', 'gRPC']
        ]
        
        education_levels = ['High School', 'Certificate', 'Associate', 'Bachelor', 'Master', 'PhD']
        locations = ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Singapore']
        
        for i in range(1, 21):
            jobseeker_data = {
                'name': f'Jobseeker {i}',
                'email': f'jobseeker{i}@smartmatch.com',
                'password': 'jobseeker123',
                'role': 'jobseeker',
                'location': random.choice(locations),
                'skills': random.choice(skills_list),
                'experience': random.randint(1, 15),
                'education': random.choice(education_levels),
                'salary_expectation': [random.randint(40000, 80000), random.randint(80000, 150000)],
                'portfolio_links': [f'https://github.com/jobseeker{i}']
            }
            
            jobseeker_id = User.create(jobseeker_data)
            jobseekers.append(jobseeker_id)
            
            # Calculate profile completeness
            User.calculate_profile_completeness(jobseeker_id)
            
            print(f"Created jobseeker {i} with ID: {jobseeker_id}")
        
        # Create jobs
        jobs = []
        job_titles = [
            'Frontend Developer',
            'Backend Developer',
            'Full Stack Developer',
            'DevOps Engineer',
            'Data Scientist',
            'Product Manager',
            'UX Designer',
            'Mobile Developer',
            'QA Engineer',
            'Technical Writer'
        ]
        
        job_descriptions = [
            'We are looking for a talented developer to join our team and help build amazing products.',
            'Join our innovative team and work on cutting-edge technology solutions.',
            'We need a skilled professional to help us deliver high-quality software to our clients.',
            'Looking for a passionate individual to contribute to our growing product portfolio.',
            'Seeking a creative problem-solver to help us tackle complex challenges.'
        ]
        
        for i in range(1, 31):
            employer_id = random.choice(employers)
            job_data = {
                'title': random.choice(job_titles),
                'description': random.choice(job_descriptions),
                'required_skills': random.sample(random.choice(skills_list), random.randint(2, 4)),
                'preferred_skills': random.sample(random.choice(skills_list), random.randint(1, 3)),
                'location': random.choice(locations),
                'salary_range': [random.randint(50000, 90000), random.randint(90000, 160000)],
                'remote': random.choice([True, False])
            }
            
            job_id = Job.create(job_data, employer_id)
            jobs.append(job_id)
            print(f"Created job {i} with ID: {job_id}")
        
        # Create applications
        for i in range(1, 51):
            jobseeker_id = random.choice(jobseekers)
            job_id = random.choice(jobs)
            
            # Check if already applied
            if Application.has_applied(jobseeker_id, job_id):
                continue
            
            job = Job.find_by_id(job_id)
            application_data = {
                'jobseeker_id': jobseeker_id,
                'job_id': job_id,
                'employer_id': job['employer_id'],
                'resume_url': f'uploads/resumes/resume_{i}.pdf',
                'cover_letter': f'I am excited to apply for this position and believe my skills and experience make me a strong candidate.',
                'status': random.choice(['Applied', 'Under Review', 'Interview', 'Hired', 'Rejected'])
            }
            
            application_id = Application.create(application_data)
            print(f"Created application {i} with ID: {application_id}")
        
        # Generate matches for all jobseekers
        for jobseeker_id in jobseekers:
            matches = MatchingService.generate_matches_for_jobseeker(jobseeker_id, 10)
            print(f"Generated {len(matches)} matches for jobseeker {jobseeker_id}")
        
        # Create notifications
        notification_types = [
            ('new_application', 'New application received', 'A jobseeker has applied to your job posting.'),
            ('application_status_change', 'Application status updated', 'Your application status has been updated.'),
            ('job_recommendation', 'New job recommendation', 'We found a new job that matches your profile.'),
            ('profile_view', 'Profile viewed', 'An employer has viewed your profile.')
        ]
        
        for i in range(1, 31):
            recipient_id = random.choice(jobseekers + employers)
            notification_type, title, message = random.choice(notification_types)
            
            notification_data = {
                'recipient_id': recipient_id,
                'type': notification_type,
                'title': title,
                'message': message,
                'read': random.choice([True, False])
            }
            
            notification_id = Notification.create(notification_data)
            print(f"Created notification {i} with ID: {notification_id}")
        
        print("Data seeding completed!")

if __name__ == '__main__':
    seed_data()