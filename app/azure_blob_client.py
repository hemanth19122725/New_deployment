# from azure.identity import DefaultAzureCredential
# from azure.storage.blob import BlobClient

# def upload_to_blob(account_name, container, blob_name, local_path):
#     credential = DefaultAzureCredential()
#     account_url = f"https://{account_name}.blob.core.windows.net"

#     blob = BlobClient(
#         account_url=account_url,
#         container_name=container,
#         blob_name=blob_name,
#         credential=credential
#     )

#     with open(local_path, "rb") as fh:
#         blob.upload_blob(fh, overwrite=True)

#     return f"Uploaded {local_path} to {container}/{blob_name}"
