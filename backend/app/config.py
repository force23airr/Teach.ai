from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    manim_quality: str = "-ql"
    output_dir: str = "./output"
    media_dir: str = "./media"
    generated_scenes_dir: str = "./generated_scenes"
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
