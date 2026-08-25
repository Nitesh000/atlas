# Atlas Production Deployment

This project uses Turborepo and a modular `docker-compose.prod.yml` to spin up the entire backend stack natively.

## Infrastructure Architecture

- **PostgreSQL** + **pgvector** (Relational & vector search)
- **Redis** (Queue backend with AOF persistence)
- **API** (Fastify Server)
- **Scraper** (Playwright + BullMQ Worker)

## Getting Started

1. Set up your `.env` variables if you want to override the injected compose ones.
2. Ensure you have Docker and Docker Compose installed.

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Note on the Frontend
Because `apps/dashboard` and `apps/widget` are static Vite applications, they are extremely lightweight and should ideally be deployed to edge networks like **Vercel**, **Cloudflare Pages**, or **Netlify** for maximum CDN performance globally. Ensure you point the `VITE_API_URL` environment variable inside your frontend deployments back to this backend's public URL/IP!