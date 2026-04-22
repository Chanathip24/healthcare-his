.PHONY: run-all run-backend run-frontend run-hapi stop logs ps

run-all:
	docker compose up --build -d

run-backend:
	docker compose up --build -d fhir-backend

run-frontend:
	docker compose up --build -d his-a-frontend

run-hapi:
	docker compose up --build -d hapi-fhir

stop:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps
