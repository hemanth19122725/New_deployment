from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
# from azure_blob_client import upload_to_blob
from enum import Enum
from pymongo import MongoClient
from datetime import datetime
import os
import shutil
import bcrypt

from sftp_client import (
    connect_and_cache, is_connected, list_files,
    upload_file, download_file, delete_file, close_connection,
    run_remote_script
)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["deployment_db"]
collection = db["deployments"]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Enums for dropdowns
class Protocol(str, Enum):
    sftp = "sftp"
    scp = "scp"

class DeployLocation(str, Enum):
    aws = "aws"
    gcp = "gcp"
    azure = "azure"
    Linux = "Linux"

class DeployType(str, Enum):
    Frontend = "Frontend"
    Backend = "Backend"

# ----------------------------
# Connect with new credentials
# ----------------------------
@app.post("/connect")
def connect(
    name: str = Form(...),
    description: str = Form(...),
    deploy_location: DeployLocation = Form(...),
    deploy_type: DeployType = Form(...),
    host: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    remote_path: str = Form(...),
    protocol: Protocol = Form(...),
    trigger_script_path: str = Form(...) 
):
    try:
        # Connect to server
        connect_and_cache(host, username, password, remote_path, protocol.value)

        # Save to MongoDB
        connection_data = {
            "name": name,
            "description": description,
            "deploy_location": deploy_location.value,
            "deploy_type": deploy_type.value,
            "host": host,
            "username": username,
            "password": password,
            "remote_path": remote_path,
            "protocol": protocol.value,
            "trigger_script_path": trigger_script_path,  
            "connected_at": datetime.utcnow()
        }
        collection.insert_one(connection_data)

        return {"status": "connected", "protocol": protocol.value, "stored": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})




# ----------------------------
# Reconnect using existing name
# ----------------------------
@app.post("/connect/existing")
def connect_existing(name: str = Form(...)):
    record = collection.find_one({"name": name})
    if not record:
        raise HTTPException(status_code=404, detail="Connection not found")

    try:
        connect_and_cache(
            host=record["host"],
            username=record["username"],
            password=record["password"],
            remote_path=record["remote_path"],
            protocol=record["protocol"]
        )
        return {"status": "connected", "protocol": record["protocol"], "name": name}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ----------------------------
# Trigger remote script manually
# ----------------------------
@app.post("/trigger-script/{name}")
def trigger_script(name: str):
    record = collection.find_one({"name": name})
    if not record:
        raise HTTPException(status_code=404, detail="Connection not found")
 
    # Auto-connect if not connected
    if not is_connected():
        try:
            connect_and_cache(
                host=record["host"],
                username=record["username"],
                password=record["password"],
                remote_path=record["remote_path"],
                protocol=record["protocol"]
            )
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": f"Failed to reconnect: {e}"})
 
    try:
        script_path = record.get("trigger_script_path")
        if not script_path:
            raise HTTPException(status_code=400, detail="No trigger script path found for this connection")
 
        script_result = run_remote_script(script_path)
 
        # Save latest script execution details
        collection.update_one(
            {"name": name},
            {"$set": {"last_script_run": script_result, "last_script_triggered_at": datetime.utcnow()}}
        )
 
        return {
            "status": "script_executed",
            "script_result": script_result
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    

# ----------------------------
# Update saved connection by name
# ----------------------------
@app.put("/connections/{name}")
def update_connection(name: str,
    description: str = Form(None),
    deploy_location: DeployLocation = Form(None),
    deploy_type: DeployType = Form(None),
    host: str = Form(None),
    username: str = Form(None),
    password: str = Form(None),
    remote_path: str = Form(None),
    protocol: Protocol = Form(None),
    trigger_script_path: str = Form(None)  # ✅ Optional field
):
    existing = collection.find_one({"name": name})
    if not existing:
        raise HTTPException(status_code=404, detail="Connection not found")

    update_fields = {}
    if description: update_fields["description"] = description
    if deploy_location: update_fields["deploy_location"] = deploy_location.value
    if deploy_type: update_fields["deploy_type"] = deploy_type.value
    if host: update_fields["host"] = host
    if username: update_fields["username"] = username
    if password: update_fields["password"] = password
    if remote_path: update_fields["remote_path"] = remote_path
    if protocol: update_fields["protocol"] = protocol.value
    if trigger_script_path: update_fields["trigger_script_path"] = trigger_script_path
    update_fields["updated_at"] = datetime.utcnow()

    collection.update_one({"name": name}, {"$set": update_fields})
    return {"status": "updated", "name": name, "fields_updated": list(update_fields.keys())}

# ----------------------------
# Get a specific saved connection
# ----------------------------
@app.get("/connections/{name}")
def get_connection_by_name(name: str):
    record = collection.find_one({"name": name}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Connection not found")
    return record

# ----------------------------
# Get all saved connections
# ----------------------------
@app.get("/connections")
def get_connections():
    try:
        connections = list(collection.find({}, {"_id": 0}))
        return {"connections": connections}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ----------------------------
# Delete a saved connection by name
# ----------------------------
@app.delete("/connections/{name}")
def delete_connection(name: str):
    result = collection.delete_one({"name": name})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Connection not found")
    return {"status": "deleted", "name": name}

# ----------------------------
# List remote files (SFTP only)
# ----------------------------
@app.get("/files")
def get_files():
    if not is_connected():
        return JSONResponse(status_code=400, content={"error": "Not connected"})
    try:
        files = list_files()
        return {"files": files}
    except NotImplementedError as e:
        return JSONResponse(status_code=501, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ----------------------------
# Upload a file
# ----------------------------
@app.post("/upload")
def upload(file: UploadFile = File(...)):
    if not is_connected():
        return JSONResponse(status_code=400, content={"error": "Not connected"})
    try:
        local_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(local_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        remote_path = upload_file(local_path, file.filename)
        return {"status": "uploaded", "remote_path": remote_path}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ----------------------------
# Download a file
# ----------------------------
@app.get("/download")
def download(filename: str):
    if not is_connected():
        return JSONResponse(status_code=400, content={"error": "Not connected"})
    try:
        local_path = os.path.join(UPLOAD_DIR, f"downloaded_{filename}")
        download_file(filename, local_path)
        return FileResponse(local_path, media_type="application/octet-stream", filename=filename)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ----------------------------
# Delete a file (SFTP only)
# ----------------------------
@app.delete("/delete")
def delete(filename: str):
    if not is_connected():
        return JSONResponse(status_code=400, content={"error": "Not connected"})
    try:
        remote_path = delete_file(filename)
        return {"status": "deleted", "remote_path": remote_path}
    except NotImplementedError as e:
        return JSONResponse(status_code=501, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ----------------------------
# Disconnect from server
# ----------------------------
@app.post("/disconnect")
def disconnect():
    try:
        close_connection()
        return {"status": "disconnected"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/validate")
def validate_connection(
    name: str = Form(...),
    host: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    remote_path: str = Form(...),
    protocol: Protocol = Form(...)
):
    try:
        # Try to connect without saving to MongoDB
        connect_and_cache(host, username, password, remote_path, protocol.value)
        close_connection()  
        return {"valid": True}
    except Exception as e:
        return {"valid": False, "error": "Authentication Failed. Please try again"}
    


# Azure upload

# @app.post("/upload-to-azure")
# def upload_to_azure():
#     result = upload_to_blob(
#         account_name="mystorageacct",
#         container="uploads",
#         blob_name="reports/test.txt",
#         local_path="../test.txt"
#     )
#     return {"status": "success", "message": result}

