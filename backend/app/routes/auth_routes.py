from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from app.utils.db import db
from bson.objectid import ObjectId

from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.utils.auth import admin_required

auth_bp = Blueprint('auth_bp', __name__)


# Create a new staff or admin account (admin-only)
@auth_bp.route('/api/admin/staff', methods=['POST'])
@admin_required()
def create_staff():
    data = request.json

    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email')
    role = data.get('role', 'staff')

    # Validate required fields
    if not username or not password or not name:
        return jsonify({
            "error": "Username, Password, and Full Name are required"
        }), 400

    # Ensure username is unique
    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    # Create new user document
    new_user = {
        "username": username,
        "password": generate_password_hash(password),
        "name": name,
        "phone": phone,
        "email": email,
        "role": role,
        "isFirstLogin": True,
        "created_at": datetime.datetime.utcnow()
    }

    db.users.insert_one(new_user)

    return jsonify({
        "message": f"{role.capitalize()} account created successfully!"
    }), 201


# Retrieve all staff members (admin-only)
@auth_bp.route('/api/admin/staff', methods=['GET'])
@admin_required()
def get_all_staff():
    staff_members = list(
        db.users.find({"role": "staff"}, {"password": 0})
    )

    # Convert ObjectId to string for JSON serialization
    for member in staff_members:
        member['_id'] = str(member['_id'])

    return jsonify({"staff": staff_members}), 200


# Authenticate user and generate JWT token
@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json

    username = data.get('username')
    password = data.get('password')

    user = db.users.find_one({"username": username})

    # Validate credentials
    if user and check_password_hash(user['password'], password):
        role = user.get('role', 'staff')
        is_first_login = user.get('isFirstLogin', False)
        name = user.get('name', '')

        # Include additional user data inside JWT claims
        additional_claims = {
            "user": username,
            "role": role,
            "name": name,
            "isFirstLogin": is_first_login
        }

        token = create_access_token(
            identity=username,
            additional_claims=additional_claims
        )

        return jsonify({
            "message": "Login successful",
            "token": token,
            "role": role,
            "isFirstLogin": is_first_login
        }), 200

    return jsonify({
        "error": "Invalid username or password"
    }), 401


# Customer signup (no authentication required)
@auth_bp.route('/api/customer/signup', methods=['POST', 'OPTIONS'])
def customer_signup():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.json

    phone = data.get('phone')
    password = data.get('password')
    name = data.get('name')

    # Validate required fields
    if not phone or not password or not name:
        return jsonify({
            "error": "Name, Phone, and Password are required"
        }), 400

    # Ensure phone number is unique for customers
    if db.users.find_one({"phone": phone, "role": "customer"}):
        return jsonify({
            "error": "Phone number already registered"
        }), 400

    # Create new customer account
    new_customer = {
        "username": phone,
        "phone": phone,
        "name": name,
        "password": generate_password_hash(password),
        "role": "customer",
        "created_at": datetime.datetime.utcnow()
    }

    db.users.insert_one(new_customer)

    return jsonify({
        "message": "Customer account created successfully!"
    }), 201


# Change password for authenticated user
@auth_bp.route('/api/change-password', methods=['POST'])
@jwt_required()
def change_password():
    username = get_jwt_identity()
    new_password = request.json.get('newPassword')

    # Validate input
    if not new_password:
        return jsonify({
            "error": "New password is required"
        }), 400

    # Update password and mark first login as completed
    db.users.update_one(
        {"username": username},
        {"$set": {
            "password": generate_password_hash(new_password),
            "isFirstLogin": False
        }}
    )

    return jsonify({
        "message": "Password updated successfully"
    }), 200


# Delete a staff member (admin-only)
@auth_bp.route('/api/admin/staff/<staff_id>', methods=['DELETE'])
@admin_required()
def delete_staff(staff_id):
    try:
        result = db.users.delete_one({"_id": ObjectId(staff_id)})

        if result.deleted_count == 1:
            return jsonify({
                "message": "Staff deleted successfully"
            }), 200
        else:
            return jsonify({
                "error": "Staff member not found in database"
            }), 404

    except Exception:
        return jsonify({
            "error": "Invalid ID format"
        }), 400