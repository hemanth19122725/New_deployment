# from pydantic import BaseModel
# from datetime import datetime
# from enum import Enum

# class DeploymentType(str, Enum):
#     aws = "AWS"
#     azure = "Azure"
#     gcp = "GCP"
#     vm = "VM(SSH)"
#     custom="Custom"

# class RegionEnum(str, Enum):
#     us_east_1 = "us-east-1"
#     us_west_2 = "us-west-2"
#     eu_central_1 = "eu-central-1"
#     eastus = "eastus"
#     westeurope = "westeurope"
#     southeastasia = "southeastasia"
#     us_central1 = "us-central1"
#     europe_west1 = "europe-west1"
#     asia_east1 = "asia-east1"

# ALL_REGIONS = {
#     "AWS": ["us-east-1", "us-west-2", "eu-central-1"],
#     "Azure": ["eastus", "westeurope", "southeastasia"],
#     "GCP": ["us-central1", "europe-west1", "asia-east1"],
#     "VM":["local","remote"]
# }

# class ConfigModel(BaseModel):
#     ip:str
#     port:int
#     username:str
#     password: str
#     base_path:str

# class DeploymentDestination(BaseModel):
#     name: str
#     type: DeploymentType
#     region: RegionEnum
#     config: ConfigModel

# class DeployementDestinationDB(DeploymentDestination):
#     app_id : str
#     created_at: datetime
#     updated_at: datetime

