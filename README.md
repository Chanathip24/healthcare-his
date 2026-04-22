# Healthcare Demo (HIS A / HIS B with FHIR)

This project is a simple demo of two hospital frontends:

- HIS A (`his-a-frontend`)
- HIS B (`his-b-frontend`)

Both frontends call the same backend API, and the backend directly calls a FHIR server.

## Architecture

- `his-a-frontend` -> `fhir-backend` -> `hapi-fhir`
- `his-b-frontend` -> `fhir-backend` -> `hapi-fhir`

The backend uses `FHIR_SERVER_URL` (set in Docker Compose) to connect to FHIR.

## Run with Docker Compose

From project root:

```bash
docker compose up --build -d
```

Check containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop everything:

```bash
docker compose down
```

## Access URLs

- HIS A frontend: [http://localhost:5173](http://localhost:5173)
- HIS B frontend: [http://localhost:5174](http://localhost:5174)
- Backend API: [http://localhost:3000](http://localhost:3000)
- FHIR server (HAPI): [http://localhost:8090/fhir](http://localhost:8090/fhir)

## Access different hospitals

Use different frontend URLs:

- Open `http://localhost:5173` for **HIS A**
- Open `http://localhost:5174` for **HIS B**

Both hospitals are separate UIs but currently share the same backend and FHIR server.

## FHIR connection in backend

In `docker-compose.yml`, backend is configured with:

- `FHIR_SERVER_URL=http://hapi-fhir:8080/fhir`

Inside Docker network, backend calls `hapi-fhir` directly by service name.
