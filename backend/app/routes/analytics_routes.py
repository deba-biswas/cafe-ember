from flask import Blueprint, jsonify
from app.utils.db import db
from app.utils.auth import admin_required

analytics_bp = Blueprint('analytics_bp', __name__)

# Endpoint to retrieve admin analytics data
@analytics_bp.route('/api/admin/analytics', methods=['GET'])
@admin_required()
def get_analytics():
    try:
        # Aggregation pipeline to compute multiple analytics in a single query
        pipeline = [
            {
                "$facet": {
                    # Calculate total number of orders
                    "total_orders": [
                        {"$count": "count"}
                    ],
                    
                    # Calculate total revenue from all orders
                    "total_revenue": [
                        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
                    ],
                    
                    # Determine the most frequently ordered item
                    "top_item": [
                        {"$unwind": "$items"},  # Flatten items array
                        {
                            "$group": {
                                "_id": "$items.name",
                                "count": {"$sum": "$items.quantity"}
                            }
                        },
                        {"$sort": {"count": -1}},  # Highest quantity first
                        {"$limit": 1}  # Select top item
                    ]
                }
            }
        ]

        # Execute aggregation pipeline
        result = list(db.orders.aggregate(pipeline))[0]

        # Safely extract results (handles empty database cases)
        total_orders = (
            result["total_orders"][0]["count"]
            if result["total_orders"] else 0
        )

        total_revenue = (
            result["total_revenue"][0]["total"]
            if result["total_revenue"] else 0
        )

        top_item = (
            result["top_item"][0]["_id"]
            if result["top_item"] else "No Sales Yet"
        )

        return jsonify({
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "top_item": top_item
        }), 200

    except Exception as e:
        # Log error for debugging
        print(f"Analytics Error: {e}")

        return jsonify({
            "error": "Failed to calculate analytics"
        }), 500