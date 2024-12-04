from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "default"   # to counter type error below
    JWT_SECRET: str = "default"
    JWT_ALGORITHM: str = "default"
    ACCESS_TOKEN_EXPIRY: str = "3600"
    SERVER_BASE_URL: str = "http://localhost:8000"
    CLIENT_BASE_URL: str = "http://localhost:5173"
    # REDIS_URL: str = "redis://localhost:6379/0"
    # MAIL_USERNAME: str
    # MAIL_PASSWORD: str
    # MAIL_FROM: str
    # MAIL_PORT: int
    # MAIL_SERVER: str
    # MAIL_FROM_NAME: str
    # MAIL_STARTTLS: bool = True
    # MAIL_SSL_TLS: bool = False
    # USE_CREDENTIALS: bool = True
    # VALIDATE_CERTS: bool = True
    # DOMAIN: str
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


Config = Settings()
