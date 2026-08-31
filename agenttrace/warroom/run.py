from __future__ import annotations

from agenttrace.warroom.http import app


application = app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("agenttrace.warroom.run:application", host="127.0.0.1", port=3001, reload=False)
