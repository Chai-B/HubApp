from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
import os
import httpx
from services import google, microsoft, github
import jwt
from fastapi import Body
from datetime import datetime
from firebase_admin import credentials, firestore, initialize_app
import firebase_admin

# Initialize Firebase Admin SDK if not already initialized
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate('../hubapp-acfaa-firebase-adminsdk-fbsvc-7d17c00386.json')
        firebase_admin_initialized = initialize_app(cred)
    else:
        firebase_admin_initialized = firebase_admin.get_app()
except Exception as e:
    print(f"Firebase initialization error: {e}")
    firebase_admin_initialized = None

# Get Firestore client
try:
    db = firestore.client()
except Exception as e:
    print(f"Firestore client error: {e}")
    db = None

router = APIRouter()

# === AUTH0 CONFIG ===
# Note: We'll get these at runtime instead of module load time
def get_auth0_config():
    return {
        'AUTH0_DOMAIN': os.environ.get('AUTH0_DOMAIN'),
        'AUTH0_CLIENT_ID': os.environ.get('AUTH0_CLIENT_ID'),
        'AUTH0_CLIENT_SECRET': os.environ.get('AUTH0_CLIENT_SECRET'),
        'AUTH0_CALLBACK_URL': os.environ.get('AUTH0_CALLBACK_URL'),
        'AUTH0_AUDIENCE': os.environ.get('AUTH0_AUDIENCE')
    }

@router.get('/auth/login')
def login(request: Request, connection: str = None):
    # Get connection parameter for provider-specific login
    config = get_auth0_config()
    
    if not all([config['AUTH0_DOMAIN'], config['AUTH0_CLIENT_ID'], config['AUTH0_CALLBACK_URL']]):
        raise HTTPException(status_code=500, detail='Auth0 configuration missing')
    
    auth_url = f"https://{config['AUTH0_DOMAIN']}/authorize?response_type=code&client_id={config['AUTH0_CLIENT_ID']}&redirect_uri={config['AUTH0_CALLBACK_URL']}&scope=openid%20profile%20email"
    
    if connection:
        auth_url += f"&connection={connection}"
    if config['AUTH0_AUDIENCE']:
        auth_url += f"&audience={config['AUTH0_AUDIENCE']}"
        
    return RedirectResponse(auth_url)

@router.get('/auth/logout')
async def logout(request: Request):
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    response = RedirectResponse(url=f'{frontend_url}')
    # Clear authentication cookies
    response.delete_cookie('id_token')
    response.delete_cookie('access_token')
    return response

@router.get('/auth/callback')
async def auth_callback(request: Request, code: str = None, error: str = None, error_description: str = None):
    # Check for errors first
    if error:
        # Redirect to frontend with error
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        return RedirectResponse(url=f'{frontend_url}/auth?error={error}&error_description={error_description}')
    
    if not code:
        raise HTTPException(status_code=400, detail='Authorization code not provided')
    
    # Exchange code for tokens
    config = get_auth0_config()
    token_url = f"https://{config['AUTH0_DOMAIN']}/oauth/token"
    data = {
        'grant_type': 'authorization_code',
        'client_id': config['AUTH0_CLIENT_ID'],
        'client_secret': config['AUTH0_CLIENT_SECRET'],
        'code': code,
        'redirect_uri': config['AUTH0_CALLBACK_URL'],
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data=data)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail='Auth0 token exchange failed')
        tokens = resp.json()
    # You can decode the id_token for user info
    id_token = tokens.get('id_token')
    access_token = tokens.get('access_token')
    
    # Store user data in database
    if id_token and db:
        try:
            # Decode the ID token to get user info
            payload = jwt.decode(id_token, options={"verify_signature": False})
            user_id = payload.get('sub')
            
            if user_id:
                # Store/update user data
                now = datetime.utcnow().isoformat()
                user_data = {
                    'id': user_id,
                    'email': payload.get('email', ''),
                    'name': payload.get('name', ''),
                    'picture': payload.get('picture', ''),
                    'firstName': payload.get('given_name', payload.get('name', '').split(' ')[0] if payload.get('name') else ''),
                    'lastName': payload.get('family_name', payload.get('name', '').split(' ')[-1] if payload.get('name') and ' ' in payload.get('name') else ''),
                    'last_login': now,
                    'updated_at': now
                }
                
                # Check if user exists to preserve created_at
                doc_ref = db.collection('users').document(user_id)
                doc = doc_ref.get()
                if not doc.exists:
                    # New user, set created_at
                    user_data['created_at'] = now
                
                doc_ref = db.collection('users').document(user_id)
                doc_ref.set(user_data, merge=True)
                print(f"User {user_id} data stored/updated successfully")
        except Exception as e:
            print(f"Error storing user data: {e}")
    
    # Set session cookie (for demo, return tokens)
    # Redirect to frontend dashboard page
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    response = RedirectResponse(url=f'{frontend_url}/dashboard')
    response.set_cookie('id_token', id_token, httponly=True, secure=False, samesite='lax')
    response.set_cookie('access_token', access_token, httponly=True, secure=False, samesite='lax')
    return response

@router.get('/dashboard')
async def dashboard(request: Request):
    # Aggregate user data from all services (stub: expects access_token in cookie)
    access_token = request.cookies.get('access_token')
    id_token = request.cookies.get('id_token')
    if not access_token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    # Get user data
    user_data = None
    if id_token:
        try:
            payload = jwt.decode(id_token, options={"verify_signature": False})
            user_id = payload.get('sub')
            
            # Basic user data from token
            user_data = {
                'id': user_id,
                'email': payload.get('email', ''),
                'name': payload.get('name', ''),
                'picture': payload.get('picture', ''),
                'firstName': payload.get('given_name', payload.get('name', '').split(' ')[0] if payload.get('name') else ''),
                'lastName': payload.get('family_name', payload.get('name', '').split(' ')[-1] if payload.get('name') and ' ' in payload.get('name') else '')
            }
            
            # Try to get additional data from database
            if db and user_id:
                try:
                    doc_ref = db.collection('users').document(user_id)
                    doc = doc_ref.get()
                    if doc.exists:
                        stored_data = doc.to_dict()
                        user_data.update(stored_data)
                except Exception as e:
                    print(f"Error fetching user from database: {e}")
        except Exception as e:
            print(f"Error decoding token: {e}")
    
    # Fetch data from services with error handling
    try:
        google_data = await google.get_calendar_events(access_token)
    except Exception as e:
        google_data = {'error': str(e), 'items': []}
    
    try:
        ms_data = await microsoft.get_calendar_events(access_token)
    except Exception as e:
        ms_data = {'error': str(e), 'value': []}
    
    try:
        github_data = await github.get_profile(access_token)
    except Exception as e:
        github_data = {'error': str(e), 'profile': {'name': 'Unknown', 'email': 'unknown@example.com'}}
    
    
    return {
        'user': user_data,
        'google': google_data,
        'microsoft': ms_data,
        'github': github_data
    }

@router.get('/google/gmail')
async def gmail(token: str):
    return await google.get_gmail_messages(token)

@router.get('/google/calendar')
async def google_calendar(token: str):
    return await google.get_calendar_events(token)

@router.get('/google/meet')
async def google_meet(token: str):
    return await google.get_meet_links(token)

@router.get('/microsoft/outlook')
async def outlook(token: str):
    return await microsoft.get_outlook_messages(token)

@router.get('/microsoft/calendar')
async def ms_calendar(token: str):
    return await microsoft.get_calendar_events(token)

@router.get('/microsoft/teams')
async def ms_teams(token: str):
    return await microsoft.get_teams_meetings(token)


@router.get('/github/profile')
async def github_profile(token: str):
    return await github.get_profile(token)

@router.get('/github/email')
async def github_email(token: str):
    return await github.get_email(token)

SUPABASE_USER_DATA_TABLE = 'user_data'

# Helper to get user_id from id_token
def get_user_id_from_token(id_token: str):
    try:
        payload = jwt.decode(id_token, options={"verify_signature": False})
        return payload.get('sub')
    except Exception:
        return None

@router.get('/session/data')
async def get_session_data(request: Request):
    id_token = request.cookies.get('id_token')
    if not id_token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    user_id = get_user_id_from_token(id_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    if not db:
        raise HTTPException(status_code=500, detail='Database not available')
    
    try:
        doc_ref = db.collection('user_data').document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict().get('data', {})
        return {}
    except Exception as e:
        print(f"Database error: {e}")
        return {}

@router.post('/session/data')
async def save_session_data(request: Request, data: dict = Body(...)):
    id_token = request.cookies.get('id_token')
    if not id_token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    user_id = get_user_id_from_token(id_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    if not db:
        raise HTTPException(status_code=500, detail='Database not available')
    
    try:
        now = datetime.utcnow().isoformat()
        doc_ref = db.collection('user_data').document(user_id)
        doc_ref.set({
            'data': data,
            'updated_at': now
        })
        return {"success": True}
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail='Failed to save data')

@router.get('/dashboard/layout')
async def get_dashboard_layout(request: Request):
    id_token = request.cookies.get('id_token')
    if not id_token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    user_id = get_user_id_from_token(id_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    if not db:
        # Return default layout if database not available
        return {
            'layout': [
                { 'i': 'welcome', 'x': 0, 'y': 0, 'w': 3, 'h': 2 },
                { 'i': 'services', 'x': 3, 'y': 0, 'w': 2, 'h': 1 },
                { 'i': 'notifications', 'x': 0, 'y': 2, 'w': 2, 'h': 2 },
                { 'i': 'assistant', 'x': 3, 'y': 1, 'w': 2, 'h': 3 }
            ]
        }
    
    try:
        doc_ref = db.collection('dashboard_layouts').document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return {
            'layout': [
                { 'i': 'welcome', 'x': 0, 'y': 0, 'w': 3, 'h': 2 },
                { 'i': 'services', 'x': 3, 'y': 0, 'w': 2, 'h': 1 },
                { 'i': 'notifications', 'x': 0, 'y': 2, 'w': 2, 'h': 2 },
                { 'i': 'assistant', 'x': 3, 'y': 1, 'w': 2, 'h': 3 }
            ]
        }
    except Exception as e:
        print(f"Database error: {e}")
        return {
            'layout': [
                { 'i': 'welcome', 'x': 0, 'y': 0, 'w': 3, 'h': 2 },
                { 'i': 'services', 'x': 3, 'y': 0, 'w': 2, 'h': 1 },
                { 'i': 'notifications', 'x': 0, 'y': 2, 'w': 2, 'h': 2 },
                { 'i': 'assistant', 'x': 3, 'y': 1, 'w': 2, 'h': 3 }
            ]
        }

@router.post('/dashboard/layout')
async def save_dashboard_layout(request: Request, data: dict = Body(...)):
    id_token = request.cookies.get('id_token')
    if not id_token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    user_id = get_user_id_from_token(id_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    if not db:
        return {"success": False, "message": "Database not available"}
    
    try:
        now = datetime.utcnow().isoformat()
        doc_ref = db.collection('dashboard_layouts').document(user_id)
        doc_ref.set({
            'layout': data.get('layout', []),
            'updated_at': now
        })
        return {"success": True}
    except Exception as e:
        print(f"Database error: {e}")
        return {"success": False, "message": str(e)}

@router.get('/user/profile')
async def get_user_profile(request: Request):
    id_token = request.cookies.get('id_token')
    if not id_token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    try:
        # Decode the ID token to get user info
        payload = jwt.decode(id_token, options={"verify_signature": False})
        user_id = payload.get('sub')
        
        # Get user data from database if available
        user_data = {
            'id': user_id,
            'email': payload.get('email', ''),
            'name': payload.get('name', ''),
            'picture': payload.get('picture', ''),
            'firstName': payload.get('given_name', payload.get('name', '').split(' ')[0] if payload.get('name') else ''),
            'lastName': payload.get('family_name', payload.get('name', '').split(' ')[-1] if payload.get('name') and ' ' in payload.get('name') else '')
        }
        
        # Get user's IP location
        client_ip = request.client.host
        if client_ip:
            try:
                # Use a free IP geolocation API
                async with httpx.AsyncClient() as client:
                    # Using ip-api.com (free tier available)
                    geo_response = await client.get(f'http://ip-api.com/json/{client_ip}')
                    if geo_response.status_code == 200:
                        geo_data = geo_response.json()
                        if geo_data.get('status') == 'success':
                            user_data['location'] = f"{geo_data.get('city', '')}, {geo_data.get('country', '')}"
                            user_data['locationDetails'] = {
                                'city': geo_data.get('city'),
                                'region': geo_data.get('regionName'),
                                'country': geo_data.get('country'),
                                'countryCode': geo_data.get('countryCode'),
                                'timezone': geo_data.get('timezone')
                            }
            except Exception as e:
                print(f"Error fetching location: {e}")
        
        if db:
            try:
                doc_ref = db.collection('users').document(user_id)
                doc = doc_ref.get()
                if doc.exists:
                    stored_data = doc.to_dict()
                    # Preserve the created_at timestamp if it exists
                    if 'created_at' in stored_data:
                        user_data['created_at'] = stored_data['created_at']
                    elif 'last_login' in stored_data:
                        user_data['created_at'] = stored_data['last_login']
                    user_data.update(stored_data)
            except Exception as e:
                print(f"Error fetching user from database: {e}")
        
        return user_data
    except Exception as e:
        print(f"Error decoding token: {e}")
        raise HTTPException(status_code=401, detail='Invalid token')

@router.post('/user/profile')
async def update_user_profile(request: Request, data: dict = Body(...)):
    id_token = request.cookies.get('id_token')
    if not id_token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    user_id = get_user_id_from_token(id_token)
    if not user_id:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    if not db:
        return {"success": False, "message": "Database not available"}
    
    try:
        now = datetime.utcnow().isoformat()
        doc_ref = db.collection('users').document(user_id)
        doc_ref.set({
            **data,
            'updated_at': now
        }, merge=True)
        return {"success": True}
    except Exception as e:
        print(f"Database error: {e}")
        return {"success": False, "message": str(e)}
