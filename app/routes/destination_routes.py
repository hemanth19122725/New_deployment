# from fastapi import APIRouter,HTTPException
# from models.user_models import DeployementDestinationDB, DeploymentDestination, ALL_REGIONS, DeploymentType
# from crud.dep_destinations import create_DepDest

# api_router = APIRouter()

# from typing import List

# @api_router.post("/app/{app_id}/destinations")
# def create_destinations(app_id: str, dests: List[DeploymentDestination]):
#     inserted = []
#     for dest in dests:
#         if dest.region.value not in ALL_REGIONS.get(dest.type.value, []):
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Region '{dest.region.value}' not valid for provider '{dest.type.value}'."
#             )
#         new_dst = create_DepDest(app_id, dest.dict())
#         inserted.append(new_dst)
#     return {"message": f"{len(inserted)} destinations saved.", "data": inserted}



# @api_router.get("/regions/{provider}", summary="Get regions for cloud provider")
# def get_regions(provider: DeploymentType):
#     return {
#         "provider": provider.value,
#         "regions": ALL_REGIONS[provider.value]
#     }