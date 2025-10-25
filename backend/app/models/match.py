# backend/app/models/match.py
from bson.objectid import ObjectId
from app import mongo
from datetime import datetime

class Match:
    collection = mongo.db.matches
    
    @classmethod
    def create(cls, data):
        result = cls.collection.insert_one(data)
        return str(result.inserted_id)
    
    @classmethod
    def find_by_id(cls, match_id):
        return cls.collection.find_one({'_id': ObjectId(match_id)})
    
    @classmethod
    def find_by_user_job(cls, user_id, job_id):
        return cls.collection.find_one({
            'user_id': user_id,
            'job_id': job_id
        })
    
    @classmethod
    def find_by_user(cls, user_id, limit=20, skip=0):
        return list(cls.collection.find({'user_id': user_id})
                   .sort('overall_score', -1)
                   .skip(skip)
                   .limit(limit))
    
    @classmethod
    def find_by_job(cls, job_id, limit=20, skip=0):
        return list(cls.collection.find({'job_id': job_id})
                   .sort('overall_score', -1)
                   .skip(skip)
                   .limit(limit))
    
    @classmethod
    def update(cls, match_id, data):
        data['updated_at'] = datetime.utcnow()
        result = cls.collection.update_one(
            {'_id': ObjectId(match_id)},
            {'$set': data}
        )
        return result.modified_count > 0
    
    @classmethod
    def delete(cls, match_id):
        result = cls.collection.delete_one({'_id': ObjectId(match_id)})
        return result.deleted_count > 0