import os
import datetime


class Config:
    # Secret key used for signing JWT tokens
    # In production, this should be set via environment variables
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "my_super_secret_cafe_key"
    )

    # Token expiration duration (2 hours)
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(hours=2)