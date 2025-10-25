# backend/tests/test_auth.py
import pytest
import json
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_register_jobseeker(client):
    """Test jobseeker registration"""
    response = client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'password123',
        'role': 'jobseeker'
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user_id'] is not None

def test_register_employer(client):
    """Test employer registration"""
    response = client.post('/api/auth/register', json={
        'name': 'Test Company',
        'email': 'company@example.com',
        'password': 'password123',
        'role': 'employer',
        'company_name': 'Test Company'
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'access_token' in data

def test_login(client):
    """Test user login"""
    # First register a user
    client.post('/api/auth/register', json={
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'password123',
        'role': 'jobseeker'
    })
    
    # Then login
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['role'] == 'jobseeker'