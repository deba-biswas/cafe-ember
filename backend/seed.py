from werkzeug.security import generate_password_hash
from pymongo import MongoClient
import datetime

# Establish direct connection to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client['cafe_database']


# Create a default superadmin account if it does not already exist
def create_master_admin():
    # Prevent duplicate admin creation
    if db.users.find_one({"username": "superadmin"}):
        print("Superadmin already exists!")
        return

    master_admin = {
        "username": "superadmin",
        "password": generate_password_hash("admin123"),
        "role": "admin",
        "created_at": datetime.datetime.utcnow()
    }

    db.users.insert_one(master_admin)

    print("Master admin account created successfully.")


# Execute script directly
if __name__ == "__main__":
    create_master_admin()