# backend/app/utils/validators.py
import re

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 8

def validate_phone_number(phone):
    pattern = r'^\+?[0-9]{10,15}$'
    return re.match(pattern, phone) is not None

def validate_salary_range(salary_range):
    if not isinstance(salary_range, list) or len(salary_range) != 2:
        return False
    
    min_salary, max_salary = salary_range
    return (
        isinstance(min_salary, (int, float)) and
        isinstance(max_salary, (int, float)) and
        min_salary >= 0 and
        max_salary >= min_salary
    )