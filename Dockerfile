FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml README.md ./
COPY agenttrace ./agenttrace
COPY promptguard ./promptguard
COPY core_integration ./core_integration

RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir ".[web]"

RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app

USER 10001:10001

EXPOSE 8000

CMD ["uvicorn", "core_integration.http:app", "--host", "0.0.0.0", "--port", "8000"]
