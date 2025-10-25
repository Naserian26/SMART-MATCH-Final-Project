# backend/app/services/analytics_service.py
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.match import Match
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from collections import defaultdict

class AnalyticsService:
    @classmethod
    def get_platform_analytics(cls, period='month'):
        # Calculate date range based on period
        now = datetime.utcnow()
        if period == 'day':
            start_date = now - timedelta(days=1)
        elif period == 'week':
            start_date = now - timedelta(weeks=1)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)
        
        # Get user growth
        user_growth = cls._get_user_growth(start_date)
        
        # Get job posting trends
        job_trends = cls._get_job_trends(start_date)
        
        # Get application trends
        application_trends = cls._get_application_trends(start_date)
        
        # Get top skills
        top_skills = cls._get_top_skills()
        
        # Get match success rate
        match_success = cls._get_match_success_rate()
        
        # Get time to hire
        time_to_hire = cls._get_time_to_hire()
        
        return {
            'user_growth': user_growth,
            'job_trends': job_trends,
            'application_trends': application_trends,
            'top_skills': top_skills,
            'match_success_rate': match_success,
            'time_to_hire': time_to_hire
        }
    
    @classmethod
    def _get_user_growth(cls, start_date):
        # Get user counts by role and date
        pipeline = [
            {
                '$match': {
                    'created_at': {'$gte': start_date}
                }
            },
            {
                '$group': {
                    '_id': {
                        'role': '$role',
                        'date': {
                            '$dateToString': {
                                'format': '%Y-%m-%d',
                                'date': '$created_at'
                            }
                        }
                    },
                    'count': {'$sum': 1}
                }
            },
            {
                '$sort': {'_id.date': 1}
            }
        ]
        
        results = list(User.collection.aggregate(pipeline))
        
        # Format results
        jobseeker_data = []
        employer_data = []
        dates = set()
        
        for result in results:
            date = result['_id']['date']
            dates.add(date)
            
            if result['_id']['role'] == 'jobseeker':
                jobseeker_data.append({'date': date, 'count': result['count']})
            else:
                employer_data.append({'date': date, 'count': result['count']})
        
        # Fill in missing dates with 0
        all_dates = sorted(list(dates))
        formatted_jobseeker = []
        formatted_employer = []
        
        for date in all_dates:
            jobseeker_count = next((item['count'] for item in jobseeker_data if item['date'] == date), 0)
            employer_count = next((item['count'] for item in employer_data if item['date'] == date), 0)
            
            formatted_jobseeker.append({'date': date, 'count': jobseeker_count})
            formatted_employer.append({'date': date, 'count': employer_count})
        
        return {
            'jobseekers': formatted_jobseeker,
            'employers': formatted_employer
        }
    
    @classmethod
    def _get_job_trends(cls, start_date):
        # Get job counts by date
        pipeline = [
            {
                '$match': {
                    'created_at': {'$gte': start_date}
                }
            },
            {
                '$group': {
                    '_id': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': '$created_at'
                        }
                    },
                    'count': {'$sum': 1}
                }
            },
            {
                '$sort': {'_id': 1}
            }
        ]
        
        results = list(Job.collection.aggregate(pipeline))
        
        # Format results
        job_data = []
        for result in results:
            job_data.append({'date': result['_id'], 'count': result['count']})
        
        return job_data
    
    @classmethod
    def _get_application_trends(cls, start_date):
        # Get application counts by date
        pipeline = [
            {
                '$match': {
                    'applied_at': {'$gte': start_date}
                }
            },
            {
                '$group': {
                    '_id': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': '$applied_at'
                        }
                    },
                    'count': {'$sum': 1}
                }
            },
            {
                '$sort': {'_id': 1}
            }
        ]
        
        results = list(Application.collection.aggregate(pipeline))
        
        # Format results
        application_data = []
        for result in results:
            application_data.append({'date': result['_id'], 'count': result['count']})
        
        return application_data
    
    @classmethod
    def _get_top_skills(cls, limit=10):
        # Get all jobseeker skills
        jobseekers = list(User.collection.find({'role': 'jobseeker'}))
        
        # Count skills
        skill_counts = defaultdict(int)
        for jobseeker in jobseekers:
            skills = jobseeker.get('skills', [])
            for skill in skills:
                skill_counts[skill.lower()] += 1
        
        # Sort by count and get top skills
        top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        # Format results
        formatted_skills = [{'skill': skill, 'count': count} for skill, count in top_skills]
        
        return formatted_skills
    
    @classmethod
    def _get_match_success_rate(cls):
        # Get applications and their corresponding matches
        applications = list(Application.collection.find({}))
        
        if not applications:
            return 0
        
        # Count applications with high match scores
        high_match_count = 0
        for application in applications:
            match = Match.find_by_user_job(application['jobseeker_id'], application['job_id'])
            if match and match['overall_score'] >= 70:
                high_match_count += 1
        
        # Calculate success rate
        success_rate = (high_match_count / len(applications)) * 100
        
        return round(success_rate, 2)
    
    @classmethod
    def _get_time_to_hire(cls):
        # Get applications with status "Hired"
        hired_applications = list(Application.collection.find({'status': 'Hired'}))
        
        if not hired_applications:
            return 0
        
        # Calculate average time to hire in days
        total_days = 0
        for application in hired_applications:
            applied_at = application['applied_at']
            
            # Get the most recent update
            updates = []
            if 'updated_at' in application:
                updates.append(application['updated_at'])
            
            if updates:
                latest_update = max(updates)
                days_diff = (latest_update - applied_at).days
                total_days += days_diff
        
        # Calculate average
        average_days = total_days / len(hired_applications)
        
        return round(average_days, 2)