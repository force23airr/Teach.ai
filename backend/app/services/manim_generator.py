import ast
from pathlib import Path

import anthropic

from app.config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "manim_system.txt").read_text()


async def generate_manim_code(
    topic: str, subject: str, script: str, error_feedback: str | None = None
) -> str:
    user_message = f"Topic: {topic}\nSubject: {subject}\n\nNarration script:\n{script}"

    if error_feedback:
        user_message += (
            f"\n\nPREVIOUS ATTEMPT FAILED with this error:\n{error_feedback}\n\n"
            "Fix the code to resolve this error. Output only the corrected Python code."
        )

    message = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
        temperature=0.4,
    )

    code = message.content[0].text

    # Strip markdown fences if present
    if code.startswith("```"):
        lines = code.split("\n")
        lines = lines[1:]  # Remove opening fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]  # Remove closing fence
        code = "\n".join(lines)

    # Validate syntax
    ast.parse(code)

    return code
