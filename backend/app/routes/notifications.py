# backend/app/routes/notifications.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    
    # Get query parameters
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    
    # Get notifications
    notifications = Notification.find_by_recipient(user_id, limit, skip, unread_only)
    
    # Format notifications for response
    for notification in notifications:
        notification['_id'] = str(notification['_id'])
    
    return jsonify(notifications), 200

@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    user_id = get_jwt_identity()
    
    count = Notification.get_unread_count(user_id)
    
    return jsonify({'count': count}), 200

@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notification_id):
    user_id = get_jwt_identity()
    
    # Check if notification exists and belongs to user
    notification = Notification.find_by_id(notification_id)
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    if notification['recipient_id'] != user_id:
        return jsonify({'error': 'Unauthorized to update this notification'}), 403
    
    # Mark as read
    success = Notification.mark_as_read(notification_id)
    
    if not success:
        return jsonify({'error': 'Failed to mark notification as read'}), 500
    
    return jsonify({'message': 'Notification marked as read'}), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_as_read():
    user_id = get_jwt_identity()
    
    # Mark all as read
    count = Notification.mark_all_as_read(user_id)
    
    return jsonify({
        'message': f'{count} notifications marked as read'
    }), 200