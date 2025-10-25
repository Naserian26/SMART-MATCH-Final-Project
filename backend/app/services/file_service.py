# backend/app/services/file_service.py
import os
from werkzeug.utils import secure_filename
from flask import current_app

def save_uploaded_file(file, subfolder=''):
    if not file:
        return None
    
    # Create upload directory if it doesn't exist
    upload_folder = current_app.config['UPLOAD_FOLDER']
    if subfolder:
        upload_folder = os.path.join(upload_folder, subfolder)
    
    os.makedirs(upload_folder, exist_ok=True)
    
    # Secure the filename
    filename = secure_filename(file.filename)
    
    # Add timestamp to filename to avoid collisions
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    filename = f"{timestamp}_{filename}"
    
    # Save the file
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    # Return relative path from uploads folder
    if subfolder:
        return os.path.join(subfolder, filename)
    return filename

def delete_file(file_path):
    if not file_path:
        return False
    
    try:
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    return False