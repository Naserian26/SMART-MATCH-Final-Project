# backend/app/services/matching_service.py
from app.models.user import User
from app.models.job import Job
from app.models.match import Match
from app.models.application import Application
from bson.objectid import ObjectId
from datetime import datetime
import math
import re
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class MatchingService:
    # Weight configuration for different matching factors
    WEIGHTS = {
        'skills': 0.25,
        'experience': 0.15,
        'education': 0.10,
        'location': 0.15,
        'salary': 0.10,
        'semantic': 0.15,
        'behavior': 0.10
    }
    
    @classmethod
    def calculate_match(cls, jobseeker_id, job_id):
        # Get jobseeker and job data
        jobseeker = User.find_by_id(jobseeker_id)
        job = Job.find_by_id(job_id)
        
        if not jobseeker or not job:
            return None
        
        # Check if already applied
        #if Application.has_applied(jobseeker_id, job_id):
            #return None
        
        # Calculate individual scores
        skills_score = cls._calculate_skills_score(jobseeker, job)
        experience_score = cls._calculate_experience_score(jobseeker, job)
        education_score = cls._calculate_education_score(jobseeker, job)
        location_score = cls._calculate_location_score(jobseeker, job)
        salary_score = cls._calculate_salary_score(jobseeker, job)
        semantic_score = cls._calculate_semantic_score(jobseeker, job)
        behavior_score = cls._calculate_behavior_score(jobseeker, job)
        
        # Calculate overall score
        overall_score = (
            skills_score * cls.WEIGHTS['skills'] +
            experience_score * cls.WEIGHTS['experience'] +
            education_score * cls.WEIGHTS['education'] +
            location_score * cls.WEIGHTS['location'] +
            salary_score * cls.WEIGHTS['salary'] +
            semantic_score * cls.WEIGHTS['semantic'] +
            behavior_score * cls.WEIGHTS['behavior']
        )
        
        # Round to nearest integer
        overall_score = int(round(overall_score))
        
        # Create match breakdown
        breakdown = {
            'skills': int(round(skills_score)),
            'experience': int(round(experience_score)),
            'education': int(round(education_score)),
            'location': int(round(location_score)),
            'salary': int(round(salary_score)),
            'semantic': int(round(semantic_score)),
            'behavior': int(round(behavior_score))
        }
        
        # Save or update match
        match_data = {
            'user_id': jobseeker_id,
            'job_id': job_id,
            'overall_score': overall_score,
            'breakdown': breakdown,
            'updated_at': datetime.utcnow()
        }
        
        existing_match = Match.find_by_user_job(jobseeker_id, job_id)
        if existing_match:
            Match.update(str(existing_match['_id']), match_data)
            match_id = str(existing_match['_id'])
        else:
            match_data['created_at'] = datetime.utcnow()
            match_id = Match.create(match_data)
        
        return {
            'match_id': match_id,
            'overall_score': overall_score,
            'breakdown': breakdown
        }
    
    @classmethod
    def _calculate_skills_score(cls, jobseeker, job):
        # Get jobseeker skills and job required/preferred skills
        jobseeker_skills = set(skill.lower() for skill in jobseeker.get('skills', []))
        required_skills = set(skill.lower() for skill in job.get('required_skills', []))
        preferred_skills = set(skill.lower() for skill in job.get('preferred_skills', []))
        
        # Calculate skill overlap
        required_match = len(jobseeker_skills & required_skills) / max(len(required_skills), 1)
        preferred_match = len(jobseeker_skills & preferred_skills) / max(len(preferred_skills), 1)
        
        # Weighted average (70% for required, 30% for preferred)
        skills_score = (required_match * 0.7 + preferred_match * 0.3) * 100
        
        return min(100, skills_score)
    
    @classmethod
    def _calculate_experience_score(cls, jobseeker, job):
        # Extract years of experience from job description
        job_exp_required = cls._extract_experience_from_text(job.get('description', ''))
        
        # Get jobseeker experience
        jobseeker_exp = jobseeker.get('experience', 0)
        
        # Calculate score based on how well experience matches requirements
        if job_exp_required <= 0:
            return 100  # No specific requirement
        
        if jobseeker_exp >= job_exp_required:
            # Bonus for having more experience than required (capped at 50% more)
            excess_ratio = min(jobseeker_exp / job_exp_required, 1.5)
            return min(100, 80 + (excess_ratio - 1) * 40)
        else:
            # Penalty for having less experience
            return max(0, (jobseeker_exp / job_exp_required) * 80)
    
    @classmethod
    def _calculate_education_score(cls, jobseeker, job):
        # Define education levels with scores
        education_levels = {
            'high school': 20,
            'certificate': 30,
            'associate': 40,
            'bachelor': 60,
            'master': 80,
            'phd': 100,
            'doctorate': 100
        }
        
        # Extract education requirements from job description
        job_education = cls._extract_education_from_text(job.get('description', ''))
        
        # Get jobseeker education
        jobseeker_education = jobseeker.get('education', '').lower()
        
        # Get scores for both
        jobseeker_score = 0
        for level, score in education_levels.items():
            if level in jobseeker_education:
                jobseeker_score = score
                break
        
        job_required_score = 0
        for level, score in education_levels.items():
            if level in job_education:
                job_required_score = score
                break
        
        # If no specific requirement, give full score
        if job_required_score == 0:
            return 100
        
        # Calculate score based on how well education matches requirements
        if jobseeker_score >= job_required_score:
            return 100
        else:
            return max(0, (jobseeker_score / job_required_score) * 100)
    
    @classmethod
    def _calculate_location_score(cls, jobseeker, job):
        # Check if job is remote
        if job.get('remote', False):
            return 100
        
        # Get locations
        jobseeker_location = jobseeker.get('location', '').lower()
        job_location = job.get('location', '').lower()
        
        # Exact match
        if jobseeker_location == job_location:
            return 100
        
        # Check if in same city/state/country
        jobseeker_parts = jobseeker_location.split(', ')
        job_parts = job_location.split(', ')
        
        # Check for any matching parts
        for part in jobseeker_parts:
            if part in job_parts:
                # More specific match gets higher score
                if jobseeker_parts.index(part) == 0 and job_parts.index(part) == 0:
                    return 90  # City match
                elif jobseeker_parts.index(part) == len(jobseeker_parts) - 1 and job_parts.index(part) == len(job_parts) - 1:
                    return 70  # Country match
                else:
                    return 80  # State/region match
        
        # No location match
        return 0
    
    @classmethod
    def _calculate_salary_score(cls, jobseeker, job):
        # Get salary ranges
        jobseeker_salary = jobseeker.get('salary_expectation', [0, 0])
        job_salary = job.get('salary_range', [0, 0])
        
        # If no salary info, give neutral score
        if not jobseeker_salary or not job_salary or 0 in job_salary:
            return 50
        
        # Calculate overlap
        min_overlap = max(jobseeker_salary[0], job_salary[0])
        max_overlap = min(jobseeker_salary[1], job_salary[1])
        
        if max_overlap < min_overlap:
            # No overlap, calculate how far apart they are
            if jobseeker_salary[0] > job_salary[1]:
                # Jobseeker expects more than job offers
                gap = jobseeker_salary[0] - job_salary[1]
                max_gap = job_salary[1]  # Normalize by job's max salary
            else:
                # Job offers more than jobseeker expects
                gap = job_salary[0] - jobseeker_salary[1]
                max_gap = jobseeker_salary[1]  # Normalize by jobseeker's max expectation
            
            # Penalty based on gap size (capped at 50)
            penalty = min(50, (gap / max_gap) * 100) if max_gap > 0 else 50
            return max(0, 50 - penalty)
        else:
            # There is overlap, calculate how much
            overlap_range = max_overlap - min_overlap
            jobseeker_range = jobseeker_salary[1] - jobseeker_salary[0]
            job_range = job_salary[1] - job_salary[0]
            
            # Calculate overlap percentage (average of both ranges)
            overlap_pct = (
                (overlap_range / jobseeker_range if jobseeker_range > 0 else 0) +
                (overlap_range / job_range if job_range > 0 else 0)
            ) / 2
            
            # Base score on overlap, with bonus for good match
            return min(100, 50 + overlap_pct * 50)
    
    @classmethod
    def _calculate_semantic_score(cls, jobseeker, job):
        # Get text data
        jobseeker_text = ' '.join([
            jobseeker.get('name', ''),
            ' '.join(jobseeker.get('skills', [])),
            jobseeker.get('education', ''),
            str(jobseeker.get('experience', 0))
        ]).lower()
        
        job_text = ' '.join([
            job.get('title', ''),
            job.get('description', ''),
            ' '.join(job.get('required_skills', [])),
            ' '.join(job.get('preferred_skills', []))
        ]).lower()
        
        # If no text data, return neutral score
        if not jobseeker_text or not job_text:
            return 50
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(stop_words='english')
        try:
            tfidf_matrix = vectorizer.fit_transform([jobseeker_text, job_text])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Convert to 0-100 scale
            return min(100, similarity * 100)
        except:
            # If TF-IDF fails, return neutral score
            return 50
    
    @classmethod
    def _calculate_behavior_score(cls, jobseeker, job):
        # This is a simplified behavioral score based on profile completeness
        # In a real system, this would include more complex behavioral signals
        
        # Get profile completeness
        profile_complete = jobseeker.get('profile_complete', 0)
        
        # Base score on profile completeness
        behavior_score = profile_complete
        
        # Bonus for recent activity
        last_active = jobseeker.get('last_active')
        if last_active:
            # Convert to datetime if it's a string
            if isinstance(last_active, str):
                from datetime import datetime
                try:
                    last_active = datetime.fromisoformat(last_active.replace('Z', '+00:00'))
                except:
                    last_active = None
            
            if last_active:
                from datetime import datetime, timedelta
                now = datetime.utcnow()
                days_since_active = (now - last_active).days
                
                # Bonus for recent activity (within last 30 days)
                if days_since_active <= 7:
                    behavior_score = min(100, behavior_score + 10)
                elif days_since_active <= 30:
                    behavior_score = min(100, behavior_score + 5)
        
        return behavior_score
    
    @classmethod
    def _extract_experience_from_text(cls, text):
        # Look for patterns like "5+ years", "3-5 years", etc.
        patterns = [
            r'(\d+)\+?\s*years?',
            r'(\d+)\s*-\s*(\d+)\s*years?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                if len(match.groups()) == 2:
                    # Range like "3-5 years", take the average
                    return (int(match.group(1)) + int(match.group(2))) / 2
                else:
                    # Single value like "5+ years"
                    return int(match.group(1))
        
        return 0
    
    @classmethod
    def _extract_education_from_text(cls, text):
        # Look for education level keywords
        education_keywords = [
            'phd', 'doctorate', 'master', 'bachelor', 'associate',
            'certificate', 'high school', 'degree'
        ]
        
        text_lower = text.lower()
        for keyword in education_keywords:
            if keyword in text_lower:
                return keyword
        
        return ''
    
    @classmethod
    def generate_matches_for_jobseeker(cls, jobseeker_id, limit=20):
        # Get all active jobs
        jobs = Job.find_all()
        
        # Calculate matches for each job
        matches = []
        for job in jobs:
            # Skip if already applied
            if Application.has_applied(jobseeker_id, str(job['_id'])):
                continue
            
            # Calculate match
            match_result = cls.calculate_match(jobseeker_id, str(job['_id']))
            if match_result:
                match_result['job_id'] = str(job['_id'])
                match_result['job_title'] = job['title']
                match_result['company_name'] = User.find_by_id(job['employer_id'])['company_name']
                match_result['location'] = job['location']
                match_result['remote'] = job.get('remote', False)
                match_result['salary_range'] = job.get('salary_range', [])
                matches.append(match_result)
        
        # Sort by overall score (descending)
        matches.sort(key=lambda x: x['overall_score'], reverse=True)
        
        return matches[:limit]
    
    @classmethod
    def generate_matches_for_job(cls, job_id, limit=20):
        # Get all jobseekers
        jobseekers = list(User.collection.find({'role': 'jobseeker'}))
        
        # Calculate matches for each jobseeker
        matches = []
        for jobseeker in jobseekers:
            # Skip if already applied
            if Application.has_applied(str(jobseeker['_id']), job_id):
                continue
            
            # Calculate match
            match_result = cls.calculate_match(str(jobseeker['_id']), job_id)
            if match_result:
                match_result['jobseeker_id'] = str(jobseeker['_id'])
                match_result['jobseeker_name'] = jobseeker['name']
                match_result['jobseeker_location'] = jobseeker.get('location', '')
                match_result['jobseeker_skills'] = jobseeker.get('skills', [])
                match_result['jobseeker_experience'] = jobseeker.get('experience', 0)
                matches.append(match_result)
        
        # Sort by overall score (descending)
        matches.sort(key=lambda x: x['overall_score'], reverse=True)
        
        return matches[:limit]