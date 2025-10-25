# backend/app/models/notification.py
from bson.objectid import ObjectId
from app import mongo
from datetime import datetime

class Notification:
    collection = mongo.db.notifications
    
    @classmethod
    def create(cls, data):
        data['created_at'] = datetime.utcnow()
        
        result = cls.collection.insert_one(data)
        return str(result.inserted_id)
    
    @classmethod
    def find_by_id(cls, notification_id):
        return cls.collection.find_one({'_id': ObjectId(notification_id)})
    
    @classmethod
    def find_by_recipient(cls, recipient_id, limit=20, skip=0, unread_only=False):
        query = {'recipient_id': recipient_id}
        if unread_only:
            query['read'] = False
        
        return list(cls.collection.find(query)
                   .sort('created_at', -1)
                   .skip(skip)
                   .limit(limit))
    
    @classmethod
    def mark_as_read(cls, notification_id):
        result = cls.collection.update_one(
            {'_id': ObjectId(notification_id)},
            {'$set': {'read': True, 'read_at': datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    @classmethod
    def mark_all_as_read(cls, recipient_id):
        result = cls.collection.update_many(
            {'recipient_id': recipient_id, 'read': False},
            {'$set': {'read': True, 'read_at': datetime.utcnow()}}
        )
        return result.modified_count
    
    @classmethod
    def get_unread_count(cls, recipient_id):
        return cls.collection.count_documents({'recipient_id': recipient_id, 'read': False})