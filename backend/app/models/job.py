# backend/app/models/job.py
from bson.objectid import ObjectId
from app import mongo
from datetime import datetime

class Job:
    collection = mongo.db.jobs
    
    @classmethod
    def create(cls, data, employer_id):
        data['employer_id'] = employer_id
        data['created_at'] = datetime.utcnow()
        data['updated_at'] = datetime.utcnow()
        data['active'] = True
        
        result = cls.collection.insert_one(data)
        return str(result.inserted_id)
    
    @classmethod
    def find_by_id(cls, job_id):
        return cls.collection.find_one({'_id': ObjectId(job_id)})
    
    @classmethod
    def find_by_employer(cls, employer_id):
        return list(cls.collection.find({'employer_id': employer_id}))
    
    @classmethod
    def find_all(cls, filters=None, limit=20, skip=0):
        query = {'active': True}
        if filters:
            if 'location' in filters:
                query['location'] = {'$regex': filters['location'], '$options': 'i'}
            if 'skills' in filters:
                query['$or'] = [
                    {'required_skills': {'$in': filters['skills']}},
                    {'preferred_skills': {'$in': filters['skills']}}
                ]
            if 'remote' in filters:
                query['remote'] = filters['remote']
        
        return list(cls.collection.find(query).sort('created_at', -1).skip(skip).limit(limit))
    
    @classmethod
    def update(cls, job_id, data):
        data['updated_at'] = datetime.utcnow()
        result = cls.collection.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': data}
        )
        return result.modified_count > 0
    
    @classmethod
    def delete(cls, job_id):
        # Soft delete by setting active to false
        result = cls.collection.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': {'active': False, 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    @classmethod
    def search(cls, query, limit=20, skip=0):
        search_query = {
            'active': True,
            '$or': [
                {'title': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}},
                {'required_skills': {'$in': [query]}}
            ]
        }
        
        return list(cls.collection.find(search_query).sort('created_at', -1).skip(skip).limit(limit))