from pathlib import Path

from openai import AsyncOpenAI

from app.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "script_system.txt").read_text()


async def generate_script(topic: str, subject: str, grade_level: str) -> str:
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Topic: {topic}\nSubject: {subject}\nLevel: {grade_level}",
            },
        ],
        temperature=0.8,
        max_tokens=1000,
    )
    return response.choices[0].message.content
