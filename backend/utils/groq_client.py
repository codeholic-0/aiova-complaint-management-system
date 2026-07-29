import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = "llama-3.1-8b-instant"
FALLBACK_MODEL = "qwen/qwen3.6-27b"


def get_groq_llm(model: str = MODEL_NAME, temperature: float = 0.1):
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model=model,
        temperature=temperature,
    )


def get_groq_llm_json(model: str = MODEL_NAME, temperature: float = 0.0):
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model=model,
        temperature=temperature,
        model_kwargs={"response_format": {"type": "json_object"}},
    )