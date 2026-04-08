import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.utils.db import db
from bson.objectid import ObjectId
from flask_jwt_extended import jwt_required
from app.utils.auth import staff_required

menu_bp = Blueprint('menu_bp', __name__)

# Allowed file extensions for image uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}


# Validate uploaded file extension
def allowed_file(filename):
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# Retrieve all menu items (public access)
@menu_bp.route('/api/menu', methods=['GET'])
def get_menu():
    try:
        menu_items = list(db.menu.find({}))

        # Convert ObjectId to string for JSON serialization
        for item in menu_items:
            item['_id'] = str(item['_id'])

        return jsonify({"menu": menu_items}), 200

    except Exception:
        return jsonify({"error": "Failed to fetch menu"}), 500


# Add a new menu item (staff/admin access)
@menu_bp.route('/api/admin/menu', methods=['POST'])
@staff_required()
def add_menu_item():
    # Extract form data (multipart/form-data)
    name = request.form.get('name')
    price = request.form.get('price')
    category = request.form.get('category')

    # Validate required fields
    if not name or not price or not category:
        return jsonify({"error": "Missing required fields"}), 400

    image_url = ""

    # Handle image upload
    if 'image' in request.files:
        file = request.files['image']

        if file and file.filename != '' and allowed_file(file.filename):
            # Sanitize filename
            filename = secure_filename(file.filename)

            # Generate unique filename to prevent collisions
            unique_filename = f"{ObjectId()}_{filename}"

            # Ensure upload directory exists
            upload_folder = os.path.join(
                current_app.root_path,
                'static',
                'uploads'
            )
            os.makedirs(upload_folder, exist_ok=True)

            # Save file to disk
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)

            # Generate accessible URL for frontend
            image_url = (
                f"http://127.0.0.1:5000/static/uploads/{unique_filename}"
            )

    try:
        new_item = {
            "name": name,
            "price": float(price),
            "category": category,
            "image_url": image_url
        }

        result = db.menu.insert_one(new_item)
        new_item['_id'] = str(result.inserted_id)

        return jsonify({
            "message": f"{new_item['name']} added to the menu!",
            "item": new_item
        }), 201

    except ValueError:
        return jsonify({
            "error": "Price must be a valid number"
        }), 400

    except Exception:
        return jsonify({
            "error": "Failed to add item to database"
        }), 500


# Delete a menu item (staff/admin access)
@menu_bp.route('/api/admin/menu/<item_id>', methods=['DELETE'])
@staff_required()
def delete_menu_item(item_id):
    try:
        result = db.menu.delete_one({"_id": ObjectId(item_id)})

        if result.deleted_count == 1:
            return jsonify({
                "message": "Menu item deleted successfully"
            }), 200

        return jsonify({"error": "Item not found"}), 404

    except Exception:
        return jsonify({
            "error": "Invalid Item ID format"
        }), 400


# Update an existing menu item (staff/admin access)
@menu_bp.route('/api/admin/menu/<item_id>', methods=['PUT'])
@staff_required()
def edit_menu_item(item_id):
    # Extract updated fields
    name = request.form.get('name')
    price = request.form.get('price')
    category = request.form.get('category')

    try:
        updated_item = {
            "name": name,
            "price": float(price),
            "category": category,
        }

        # Process new image if provided
        if 'image' in request.files:
            file = request.files['image']

            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{ObjectId()}_{filename}"

                upload_folder = os.path.join(
                    current_app.root_path,
                    'static',
                    'uploads'
                )
                os.makedirs(upload_folder, exist_ok=True)

                file_path = os.path.join(upload_folder, unique_filename)
                file.save(file_path)

                updated_item["image_url"] = (
                    f"http://127.0.0.1:5000/static/uploads/{unique_filename}"
                )

        result = db.menu.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": updated_item}
        )

        if result.matched_count == 1:
            return jsonify({
                "message": "Menu item updated successfully!"
            }), 200

        return jsonify({"error": "Item not found"}), 404

    except ValueError:
        return jsonify({
            "error": "Price must be a valid number"
        }), 400

    except Exception:
        return jsonify({
            "error": "Invalid Item ID format or database error"
        }), 500