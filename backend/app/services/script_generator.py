from pathlib import Path

import anthropic

from app.config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "script_system.txt").read_text()


async def generate_script(topic: str, subject: str, grade_level: str) -> str:
    message = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1200,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Topic: {topic}\nSubject: {subject}\nLevel: {grade_level}",
            }
        ],
        temperature=0.8,
    )
    return message.content[0].text
