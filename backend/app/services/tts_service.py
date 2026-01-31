from pathlib import Path

from openai import AsyncOpenAI

from app.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)


async def generate_narration(task_id: str, script: str) -> Path:
    output_dir = Path(settings.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / f"{task_id}_narration.mp3"

    async with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="nova",
        input=script,
        instructions=(
            "Speak with energy and enthusiasm, like a passionate science communicator "
            "giving a TED talk. Moderate pace, clear enunciation. "
            "Build excitement when discussing real-world applications."
        ),
        response_format="mp3",
    ) as response:
        with open(output_path, "wb") as f:
            async for chunk in response.iter_bytes():
                f.write(chunk)

    return output_path
