from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "EXAVITQu4vr4xnSDxMaL"  # "Sarah" - energetic female voice
    manim_quality: str = "-ql"
    output_dir: str = "./output"
    media_dir: str = "./media"
    generated_scenes_dir: str = "./generated_scenes"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
