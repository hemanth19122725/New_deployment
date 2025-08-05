# from datetime import datetime
# from bson import ObjectId
# from database.deployment_db import db
# import bcrypt
# import uuid

# def create_DepDest(app_id:str, data: dict):
#     config_data = data["config"]

#     hashed_password = bcrypt.hashpw(config_data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

#     config_data["password"] = hashed_password

#     record = {
#         "app_id":app_id if app_id else f"app_{uuid.uuid5().hex[:8]}",
#         "name" : data["name"],
#         "type" : data["type"],
#         "region" : data["region"],
#         "config" : config_data,
#         "created_at":datetime.utcnow(),
#         "updated_at":datetime.utcnow()
#     }

#     res = db["deploymentDestinations"].insert_one(record)
#     record["_id"] = str(res.inserted_id)
#     return record