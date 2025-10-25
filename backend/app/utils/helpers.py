# backend/app/utils/helpers.py
import re
from datetime import datetime

def extract_skills_from_text(text):
    """Extract skills from job description or resume text"""
    # Common tech skills pattern
    tech_skills = [
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'django',
        'flask', 'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker',
        'kubernetes', 'git', 'html', 'css', 'typescript', 'php', 'ruby', 'swift',
        'kotlin', 'scala', 'go', 'rust', 'c++', 'c#', '.net', 'spring', 'laravel'
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    for skill in tech_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill.title())
    
    return found_skills

def calculate_experience_years(start_date, end_date=None):
    """Calculate years of experience from start date to end date or now"""
    if isinstance(start_date, str):
        try:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except:
            return 0
    
    if end_date is None:
        end_date = datetime.utcnow()
    elif isinstance(end_date, str):
        try:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except:
            end_date = datetime.utcnow()
    
    delta = end_date - start_date
    return max(0, delta.days / 365.25)

def sanitize_filename(filename):
    """Sanitize filename for secure storage"""
    # Remove path components
    filename = os.path.basename(filename)
    
    # Remove special characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # Replace spaces with underscores
    filename = re.sub(r'\s+', '_', filename)
    
    # Limit length
    if len(filename) > 100:
        name, ext = os.path.splitext(filename)
        filename = name[:100-len(ext)] + ext
    
    return filename