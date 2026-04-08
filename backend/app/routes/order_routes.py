import random
from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.db import db
from bson.objectid import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.auth import staff_required
from app.utils.socket import socketio

order_bp = Blueprint('order_bp', __name__)


# Create a new order (supports guest and authenticated users)
@order_bp.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json

    phone_number = data.get('phone_number')
    items = data.get('items')
    total_price = data.get('total_price')

    # Validate required fields
    if not phone_number or not items:
        return jsonify({
            "error": "Missing phone number or items"
        }), 400

    # Generate a random 4-digit order number
    order_number = str(random.randint(1000, 9999))

    # Construct order document
    new_order = {
        "order_number": order_number,
        "customer_name": data.get('customer_name', 'Guest'),
        "phone_number": phone_number,
        "items": items,
        "total_price": total_price,
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    result = db.orders.insert_one(new_order)

    # Emit real-time update to connected kitchen clients
    socketio.emit(
        'kitchen_update',
        {'message': f'New order #{order_number} arrived!'}
    )

    return jsonify({
        "message": "Order placed successfully!",
        "order_id": str(result.inserted_id),
        "order_number": order_number
    }), 201


# Retrieve orders for the authenticated customer
@order_bp.route('/api/my-orders', methods=['GET'])
@jwt_required()
def get_my_orders():
    try:
        # Extract customer identity from JWT
        customer_phone = get_jwt_identity()

        user_orders = list(
            db.orders.find(
                {"phone_number": customer_phone},
                {"_id": 0}
            ).sort("created_at", -1)
        )

        return jsonify({"orders": user_orders}), 200

    except Exception:
        return jsonify({
            "error": "Failed to fetch orders"
        }), 500


# Retrieve all pending orders (staff access)
@order_bp.route('/api/orders/pending', methods=['GET'])
@staff_required()
def get_pending_orders():
    pending_orders = list(
        db.orders.find({"status": "pending"}).sort("created_at", 1)
    )

    # Convert ObjectId to string
    for order in pending_orders:
        order['_id'] = str(order['_id'])

    return jsonify({"orders": pending_orders}), 200


# Update order status (staff access)
@order_bp.route('/api/orders/<order_id>/status', methods=['PUT'])
@staff_required()
def update_order_status(order_id):
    data = request.json
    new_status = data.get('status')

    # Validate allowed status values
    if new_status not in ['pending', 'preparing', 'ready', 'completed']:
        return jsonify({"error": "Invalid status"}), 400

    try:
        result = db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": new_status}}
        )

        if result.modified_count == 1:
            # Emit real-time update for status changes
            socketio.emit(
                'kitchen_update',
                {'message': f'Order status changed to {new_status}!'}
            )

            return jsonify({
                "message": f"Order marked as {new_status}!"
            }), 200

        return jsonify({
            "message": "Status is already up to date or order not found."
        }), 200

    except Exception:
        return jsonify({
            "error": "Invalid Order ID"
        }), 400


# Retrieve all orders (staff/admin access)
@order_bp.route('/api/admin/orders', methods=['GET'])
@staff_required()
def get_all_orders():
    all_orders = list(
        db.orders.find({}).sort("created_at", -1)
    )

    # Convert ObjectId to string
    for order in all_orders:
        order['_id'] = str(order['_id'])

    return jsonify({"orders": all_orders}), 200