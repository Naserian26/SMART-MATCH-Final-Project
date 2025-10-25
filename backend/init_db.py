# backend/init_db.py
from app import create_app
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.match import Match
from app.models.notification import Notification
from bson.objectid import ObjectId

def init_indexes():
    """Initialize MongoDB indexes for better performance"""
    app = create_app()
    
    with app.app_context():
        # User indexes
        User.collection.create_index("email", unique=True)
        User.collection.create_index("role")
        User.collection.create_index("created_at")
        
        # Job indexes
        Job.collection.create_index("employer_id")
        Job.collection.create_index("created_at")
        Job.collection.create_index("active")
        Job.collection.create_index([
            ("title", "text"),
            ("description", "text"),
            ("required_skills", "text"),
            ("preferred_skills", "text")
        ])
        
        # Application indexes
        Application.collection.create_index([("jobseeker_id", 1), ("job_id", 1)], unique=True)
        Application.collection.create_index("job_id")
        Application.collection.create_index("employer_id")
        Application.collection.create_index("applied_at")
        
        # Match indexes
        Match.collection.create_index([("user_id", 1), ("job_id", 1)], unique=True)
        Match.collection.create_index("overall_score")
        Match.collection.create_index("updated_at")
        
        # Notification indexes
        Notification.collection.create_index("recipient_id")
        Notification.collection.create_index("read")
        Notification.collection.create_index("created_at")
        
        print("Database indexes created successfully!")

if __name__ == '__main__':
    init_indexes()