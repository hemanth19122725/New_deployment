from pydantic_settings import BaseSettings
from pydantic import Extra

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    db_name: str = "deploymentDB"
    sftp_ip: str
    sftp_user: str
    sftp_pswd: str

    class Config:
        env_file = ".env"
        extra = Extra.allow

settings = Settings()