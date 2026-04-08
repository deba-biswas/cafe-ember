from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


# Restrict access to admin users only
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Ensure a valid JWT is present
            verify_jwt_in_request()

            # Extract custom claims from token
            claims = get_jwt()

            # Check if user has admin role
            if claims.get("role") != "admin":
                return jsonify({
                    "error": "Forbidden: Admins only"
                }), 403

            return fn(*args, **kwargs)

        return decorator
    return wrapper


# Restrict access to staff and admin users
def staff_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Ensure a valid JWT is present
            verify_jwt_in_request()

            # Extract custom claims from token
            claims = get_jwt()

            # Allow access only for staff or admin roles
            if claims.get("role") not in ["admin", "staff"]:
                return jsonify({
                    "error": "Forbidden: Staff or Admins only"
                }), 403

            return fn(*args, **kwargs)

        return decorator
    return wrapper