from pymongo import MongoClient
import bcrypt
 
# Step 1: Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["deployAgentDB"]
users_collection = db["users"]
 
# Function to register/create a user
def create_user(username, password):
    if users_collection.find_one({"username": username}):
        return "Username already exists."
 
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
 
    users_collection.insert_one({
        "username": username,
        "password": hashed_password
    })
 
    return "User created successfully."
 
# Function to log in user by verifying credentials
def login_user(username, password):
    # Find user by username
    user = users_collection.find_one({"username": username})
    if not user:
        return "User does not exist."
 
    # Get hashed password from DB
    stored_password = user['password']
 
    # Check if entered password matches stored hash
    if bcrypt.checkpw(password.encode('utf-8'), stored_password):
        return "Login successful."
    else:
        return "Invalid password."
 
# Menu to choose action
if __name__ == "__main__":
    print("Choose an option:")
    print("1. Register")
    print("2. Login")
    choice = input("Enter your choice (1 or 2): ")
 
    uname = input("Enter username: ")
    pwd = input("Enter password: ")
 
    if choice == "1":
        result = create_user(uname, pwd)
    elif choice == "2":
        result = login_user(uname, pwd)
    else:
        result = "Invalid choice."
 
    print(result)
