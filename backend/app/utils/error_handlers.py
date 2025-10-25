# backend/app/utils/error_handlers.py
from flask import jsonify
from werkzeug.exceptions import HTTPException

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden'}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(409)
    def conflict(error):
        return jsonify({'error': 'Conflict'}), 409
    
    @app.errorhandler(413)
    def too_large(error):
        return jsonify({'error': 'File too large'}), 413
    
    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({'error': 'Unprocessable entity'}), 422
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        # Log the error
        app.logger.error(f'Unhandled exception: {error}')
        
        # Return generic error message
        if isinstance(error, HTTPException):
            return jsonify({'error': error.description}), error.code
        else:
            return jsonify({'error': 'An unexpected error occurred'}), 500