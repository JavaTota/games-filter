.PHONY: up down logs frontend-check backend-check

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

frontend-check:
	cd frontend && npm ci && npm run check

backend-check:
	cd backend && python -m pip install -r requirements-dev.txt && ruff check app tests && pytest
