# backend/app/models/application.py
from bson.objectid import ObjectId
from app import mongo
from datetime import datetime

class Application:
    collection = mongo.db.applications
    
    @classmethod
    def create(cls, data):
        data['applied_at'] = datetime.utcnow()
        data['status'] = 'Applied'  # Initial status
        
        result = cls.collection.insert_one(data)
        return str(result.inserted_id)
    
    @classmethod
    def find_by_id(cls, application_id):
        return cls.collection.find_one({'_id': ObjectId(application_id)})
    
    @classmethod
    def find_by_jobseeker(cls, jobseeker_id):
        return list(cls.collection.find({'jobseeker_id': jobseeker_id}).sort('applied_at', -1))
    
    @classmethod
    def find_by_job(cls, job_id):
        return list(cls.collection.find({'job_id': job_id}).sort('applied_at', -1))
    
    @classmethod
    def update_status(cls, application_id, status, notes=None):
        update_data = {
            'status': status,
            'updated_at': datetime.utcnow()
        }
        
        if notes:
            update_data['notes'] = notes
        
        result = cls.collection.update_one(
            {'_id': ObjectId(application_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    @classmethod
    def has_applied(cls, jobseeker_id, job_id):
        return cls.collection.find_one({
            'jobseeker_id': jobseeker_id,
            'job_id': job_id
        }) is not None