Absolutely. I'll update the plan to make the **customer dashboard React + Vite**, while keeping **Next.js only for the internal admin**.

````markdown
# Atlas — Development Plan

## 1. Project Overview

Atlas is a SaaS platform that allows customers to create an AI-powered support bot trained from their website content.

### Initial MVP

A customer can:

1. Create an account.
2. Add a website.
3. Crawl the website.
4. Extract and clean the content.
5. Chunk the content.
6. Generate embeddings.
7. Store the embeddings in PostgreSQL + pgvector.
8. Test the support bot.
9. Embed the support bot into their website.
10. View and manage their indexed data and usage.

For the MVP, each organization has **one Support Bot**.

---

# 2. Architecture

```text
                         ┌─────────────────────┐
                         │   Customer Website  │
                         │                     │
                         │   Atlas Chat Widget │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       API           │
                         │      Fastify        │
                         └──────┬──────┬───────┘
                                │      │
                    ┌───────────┘      └────────────┐
                    ▼                               ▼
             PostgreSQL                         Redis
             + pgvector                          Queue
                    ▲                               │
                    │                               ▼
                    │                         Scraper Worker
                    │                           Playwright
                    │                               │
                    │                         Crawl Website
                    │                               │
                    │                         Clean Content
                    │                               │
                    │                           Chunk Data
                    │                               │
                    │                         Generate Embeddings
                    │                               │
                    └───────────────────────────────┘


      ┌──────────────────────┐
      │ Customer Dashboard   │
      │ React + Vite         │
      └──────────┬───────────┘
                 │
                 ▼
                API


      ┌──────────────────────┐
      │ Internal Admin       │
      │ Next.js              │
      └──────────┬───────────┘
                 │
                 ▼
                API
```
````

---

# 3. Monorepo

## Repository Structure

```text
atlas/
│
├── apps/
│   ├── api/                # Fastify backend
│   ├── scraper/            # Playwright scraper worker
│   ├── dashboard/          # Customer dashboard
│   ├── admin/              # Internal admin dashboard
│   └── widget/             # Embeddable support chat
│
├── packages/
│   ├── ai/                 # Groq integration
│   ├── auth/               # Authentication utilities
│   ├── config/             # Shared configuration
│   ├── database/           # Drizzle + PostgreSQL
│   ├── embeddings/         # Hugging Face embeddings
│   ├── logger/             # Pino
│   ├── types/              # Shared TypeScript types
│   ├── validation/         # Shared Zod schemas
│   └── utils/              # Generic utilities
│
├── docker/
│   ├── postgres/
│   └── compose.yml
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── scraper.md
│   ├── deployment.md
│   ├── roadmap.md
│   └── decisions/
│
├── .github/
│   └── workflows/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── README.md
```

---

# 4. Technology Stack

| Area               | Technology     |
| ------------------ | -------------- |
| Language           | TypeScript     |
| Runtime            | Node.js        |
| Package Manager    | pnpm           |
| Monorepo           | Turborepo      |
| Backend            | Fastify        |
| ORM                | Drizzle ORM    |
| Database           | PostgreSQL     |
| Vector Search      | pgvector       |
| Queue              | BullMQ         |
| Queue Backend      | Redis          |
| Scraper            | Playwright     |
| Customer Dashboard | React + Vite   |
| Internal Admin     | Next.js        |
| Chat Widget        | React + Vite   |
| Validation         | Zod            |
| Logging            | Pino           |
| LLM                | Groq           |
| Embeddings         | Hugging Face   |
| Styling            | Tailwind CSS   |
| Containers         | Docker         |
| CI/CD              | GitHub Actions |

---

# 5. Infrastructure

## PostgreSQL

PostgreSQL will store:

- Users
- Organizations
- Projects
- Websites
- Pages
- Chunks
- Conversations
- Messages
- Usage
- Plans
- Subscriptions
- Crawl jobs

PostgreSQL will also use:

```text
pgvector
```

for vector similarity search.

---

## Redis

Redis will be used for:

- BullMQ
- Crawl queues
- Job status
- Retry handling
- Rate limiting
- Temporary/cache data

---

## Docker

Development Docker environment:

```text
Docker
│
├── PostgreSQL + pgvector
└── Redis
```

The application code will run directly on the host during development.

---

# 6. Backend — Fastify

Location:

```text
apps/api/
```

## Authentication

- [ ] Better Auth integration (Email/Password)
- [ ] Registration
- [ ] Login
- [ ] Logout
- [ ] Session management
- [ ] Password reset
- [ ] API keys
- [ ] Authentication middleware

---

## Organizations

- [ ] Create organization
- [ ] Update organization
- [ ] Delete organization
- [ ] Organization membership

Team members can be added later.

---

## Support Bot

For the MVP:

```text
Organization
└── Support Bot
```

Features:

- [ ] Create bot
- [ ] Update bot
- [ ] Delete bot
- [ ] Bot settings
- [ ] Bot system prompt

---

## Website Management

- [ ] Add website
- [ ] Validate URL
- [ ] Detect sitemap
- [ ] Remove website
- [ ] Enable/disable website
- [ ] Start crawl
- [ ] Stop crawl
- [ ] Re-crawl website

---

## Crawl Jobs

- [ ] Create crawl job
- [ ] Queue crawl job
- [ ] Track job status
- [ ] Track progress
- [ ] Cancel job
- [ ] Retry job
- [ ] Crawl history
- [ ] Failed page tracking

Possible states:

```text
queued
running
completed
failed
cancelled
```

---

## Pages

- [ ] Store crawled pages
- [ ] Store page title
- [ ] Store URL
- [ ] Store cleaned content
- [ ] Delete page
- [ ] Re-index page

---

## Documents

Future:

- [ ] Upload PDF
- [ ] Delete PDF
- [ ] Re-index PDF

---

## FAQ

Future:

- [ ] Create FAQ
- [ ] Update FAQ
- [ ] Delete FAQ

---

# 7. Scraper

Location:

```text
apps/scraper/
```

## Crawling

- [ ] Crawl website
- [ ] Follow internal links
- [ ] Crawl sitemap
- [ ] Respect robots.txt
- [ ] Ignore external domains
- [ ] Detect duplicate URLs
- [ ] Crawl limits

---

## Content Extraction

Extract:

- [ ] Title
- [ ] Metadata
- [ ] Headings
- [ ] Paragraphs
- [ ] Lists
- [ ] Tables
- [ ] Main content

---

## Content Cleaning

Remove:

- [ ] Navigation
- [ ] Footer
- [ ] Scripts
- [ ] Styles
- [ ] Cookie banners
- [ ] Repeated content
- [ ] Unnecessary HTML

---

## Chunking

- [ ] Split content into chunks
- [ ] Preserve headings
- [ ] Store page metadata
- [ ] Store chunk metadata

Example:

```text
Page
 ├── Chunk 1
 ├── Chunk 2
 ├── Chunk 3
 └── Chunk 4
```

---

## Embeddings

- [ ] Generate embeddings
- [ ] Store vectors
- [ ] Associate vectors with chunks
- [ ] Re-index chunks

---

# 8. Vector Search

Initial implementation:

```text
PostgreSQL
└── pgvector
```

## Features

- [ ] Similarity search
- [ ] Metadata filtering
- [ ] Organization filtering
- [ ] Bot filtering
- [ ] Top-K retrieval
- [ ] Distance threshold

---

## Vector Store Abstraction

Keep vector operations behind an interface.

```text
packages/
└── embeddings/
```

or a future dedicated:

```text
packages/
└── vector-store/
```

This allows a future migration to:

- Qdrant
- Milvus
- Another vector database

without coupling the entire application to the database implementation.

---

# 9. RAG Pipeline

```text
User Question
      │
      ▼
Generate Query Embedding
      │
      ▼
Vector Search
      │
      ▼
Retrieve Relevant Chunks
      │
      ▼
Build Prompt
      │
      ▼
Groq
      │
      ▼
Streaming Response
```

## Features

- [ ] Query embedding
- [ ] Vector search
- [ ] Context selection
- [ ] Prompt construction
- [ ] Groq request
- [ ] Streaming response
- [ ] Citations
- [ ] Conversation context

---

# 10. Customer Dashboard

Location:

```text
apps/dashboard/
```

Technology:

```text
React
Vite
React Router
TanStack Query
```

## Authentication

- [ ] Login
- [ ] Register
- [ ] Forgot password
- [ ] Reset password
- [ ] Logout

---

## Dashboard

Display:

- [ ] Indexed pages
- [ ] Indexed chunks
- [ ] Storage usage
- [ ] Messages used
- [ ] Current plan
- [ ] Crawl status

---

## Website Management

- [ ] Add website
- [ ] Remove website
- [ ] Start crawl
- [ ] Stop crawl
- [ ] Re-crawl
- [ ] View crawl status
- [ ] View crawl history

---

## Data

Display:

- [ ] Number of pages
- [ ] Number of chunks
- [ ] Number of websites
- [ ] Last crawl
- [ ] Failed pages

---

## Playground

Allow customers to test their support bot.

```text
┌─────────────────────────────┐
│        Support Bot          │
├─────────────────────────────┤
│                             │
│ User: How do refunds work?  │
│                             │
│ Bot: According to...        │
│                             │
├─────────────────────────────┤
│ Ask something...        ➤   │
└─────────────────────────────┘
```

---

## Widget Configuration

- [ ] Bot name
- [ ] Welcome message
- [ ] Theme color
- [ ] Position
- [ ] Avatar
- [ ] Logo
- [ ] Widget preview

---

## Embed Code

Generate:

```html
<script src="https://.../widget.js"></script>
```

Features:

- [ ] Generate embed code
- [ ] Copy embed code
- [ ] Widget preview

---

## Conversations

- [ ] View conversations
- [ ] Search conversations
- [ ] View messages
- [ ] Delete conversations

---

## Usage

Display:

```text
Pages
Chunks
Storage
Messages
```

with:

```text
Used / Limit
```

---

## Billing

- [ ] Current plan
- [ ] Usage
- [ ] Plan limits
- [ ] Upgrade plan
- [ ] Payment history

---

## Settings

- [ ] Organization settings
- [ ] Support bot settings
- [ ] API keys
- [ ] Account settings

---

# 11. Internal Admin

Location:

```text
apps/admin/
```

Technology:

```text
Next.js
```

## Dashboard

Display:

- [ ] Total users
- [ ] Active organizations
- [ ] Active bots
- [ ] Total messages
- [ ] Crawl jobs
- [ ] AI usage
- [ ] Revenue

---

## Customers

- [ ] List customers
- [ ] Search customers
- [ ] View customer
- [ ] Suspend customer
- [ ] Delete customer
- [ ] Change plan
- [ ] Adjust usage limits

---

## Plans

- [ ] Create plan
- [ ] Edit plan
- [ ] Delete plan
- [ ] Set page limit
- [ ] Set message limit
- [ ] Set storage limit
- [ ] Set website limit

Example:

```text
Free
├── Websites: 1
├── Pages: 100
├── Storage: 50 MB
└── Messages: 500/month

Pro
├── Websites: 10
├── Pages: 5,000
├── Storage: 5 GB
└── Messages: 100,000/month
```

---

## Crawl Jobs

- [ ] View jobs
- [ ] View running jobs
- [ ] View failed jobs
- [ ] Retry jobs
- [ ] Cancel jobs

---

## Workers

- [ ] Worker status
- [ ] Active jobs
- [ ] CPU usage
- [ ] Memory usage
- [ ] Worker errors

---

## AI Usage

- [ ] Groq requests
- [ ] Embedding requests
- [ ] Token usage
- [ ] Estimated AI cost

---

## Storage

- [ ] Database usage
- [ ] Vector count
- [ ] Organization usage

---

## Payments

- [ ] Transactions
- [ ] Subscriptions
- [ ] Refunds
- [ ] Invoices

---

## Logs

- [ ] API logs
- [ ] Scraper logs
- [ ] Error logs
- [ ] Job logs

---

# 12. Chat Widget

Location:

```text
apps/widget/
```

Technology:

```text
React
Vite
```

The widget should remain lightweight and framework-independent.

---

## Chat

- [ ] Open
- [ ] Close
- [ ] Send message
- [ ] Streaming response
- [ ] Loading state
- [ ] Error state

---

## Appearance

- [ ] Bot name
- [ ] Avatar
- [ ] Welcome message
- [ ] Theme color
- [ ] Position
- [ ] Dark mode

---

## Conversation

- [ ] Persist session
- [ ] Clear conversation
- [ ] Conversation history

---

## Feedback

Future:

- [ ] Helpful
- [ ] Not helpful

---

## Responsive

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

---

# 13. Shared Packages

## Database

```text
packages/database/
```

Responsibilities:

- [ ] Drizzle configuration
- [ ] Schema
- [ ] Migrations
- [ ] Database client
- [ ] pgvector configuration

---

## AI

```text
packages/ai/
```

Responsibilities:

- [ ] Groq client
- [ ] Prompt builder
- [ ] Streaming
- [ ] AI provider abstraction

---

## Embeddings

```text
packages/embeddings/
```

Responsibilities:

- [ ] Hugging Face client
- [ ] Embedding generation
- [ ] Embedding utilities

---

## Authentication

```text
packages/auth/
```

Responsibilities:

- [ ] Better Auth setup (Email/Password)
- [ ] Session management
- [ ] Authentication helpers
- [ ] Authorization
- [ ] Permission checks

---

## Types

```text
packages/types/
```

Shared:

- [ ] User types
- [ ] Organization types
- [ ] Website types
- [ ] Crawl types
- [ ] Chat types
- [ ] Usage types

---

## Validation

```text
packages/validation/
```

Shared Zod schemas:

- [ ] Authentication
- [ ] Website
- [ ] Project
- [ ] Chat
- [ ] User
- [ ] Usage

---

## Logger

```text
packages/logger/
```

Using:

```text
Pino
```

Responsibilities:

- [ ] Logger instance
- [ ] Structured logging
- [ ] Error logging
- [ ] Request logging

---

## Config

```text
packages/config/
```

Responsibilities:

- [ ] Environment variables
- [ ] Environment validation
- [ ] Shared configuration

---

## Utils

```text
packages/utils/
```

Generic utilities shared across applications.

---

# 14. Database

Initial entities:

```text
User
Organization
OrganizationMember
Project
Website
Page
Chunk
CrawlJob
Conversation
Message
Usage
Plan
Subscription
ApiKey
```

Future entities:

```text
Document
Faq
Invoice
Payment
Feedback
```

---

# 15. Usage & Limits

Every organization should have usage tracking.

Example:

```text
Organization
│
├── Plan
│
└── Usage
     ├── websites
     ├── pages
     ├── chunks
     ├── storage
     └── messages
```

The API must enforce limits.

The dashboard should **display** limits, but must never be trusted to enforce them.

Example:

```text
Customer
     │
     ▼
API
     │
     ▼
Check Plan Limits
     │
     ├── Allowed → Continue
     │
     └── Exceeded → Reject
```

---

# 16. Development Phases

## Phase 1 — Monorepo

- [ ] Initialize Git
- [ ] Initialize pnpm
- [ ] Configure Turborepo
- [ ] Create apps
- [ ] Create packages
- [ ] Configure TypeScript
- [ ] Configure Biome
- [ ] Configure shared environment variables

---

# Phase 2 — Infrastructure

- [ ] Docker Compose
- [ ] PostgreSQL
- [ ] pgvector
- [ ] Redis
- [ ] Verify connections

---

# Phase 3 — Backend Foundation

- [ ] Fastify
- [ ] Pino
- [ ] Zod
- [ ] Drizzle
- [ ] Database schema
- [ ] Migrations
- [ ] Error handling
- [ ] API structure

---

# Phase 4 — Authentication

- [ ] Better Auth setup
- [ ] Registration / Login (Email & Password)
- [ ] Session management
- [ ] Authentication middleware
- [ ] Protected routes

---

# Phase 5 — Website Management

- [ ] Website CRUD
- [ ] Crawl job creation
- [ ] Redis/BullMQ
- [ ] Job status
- [ ] Job cancellation
- [ ] Job retry

---

# Phase 6 — Scraper

- [ ] Playwright
- [ ] Sitemap detection
- [ ] URL discovery
- [ ] Page crawling
- [ ] Content extraction
- [ ] Content cleaning
- [ ] Chunking

---

# Phase 7 — RAG

- [ ] Hugging Face embeddings
- [ ] pgvector
- [ ] Vector storage
- [ ] Similarity search
- [ ] Context retrieval
- [ ] Groq integration
- [ ] Prompt construction
- [ ] Streaming responses
- [ ] Citations

---

# Phase 8 — Customer Dashboard

- [ ] React + Vite
- [ ] Authentication
- [ ] Dashboard
- [ ] Website management
- [ ] Crawl progress
- [ ] Usage
- [ ] Playground
- [ ] Settings

---

# Phase 9 — Widget

- [ ] React + Vite
- [ ] Chat UI
- [ ] API integration
- [ ] Streaming
- [ ] Session management
- [ ] Customization
- [ ] Embed script
- [ ] Production build

---

# Phase 10 — SaaS

- [ ] Plans
- [ ] Usage limits
- [ ] Billing
- [ ] Subscription management
- [ ] Payment webhooks
- [ ] Usage enforcement

---

# Phase 11 — Internal Admin

- [ ] Next.js admin
- [ ] Customer management
- [ ] Plan management
- [ ] Crawl management
- [ ] Usage monitoring
- [ ] AI usage
- [ ] Worker monitoring
- [ ] Logs

---

# Phase 12 — Production

- [ ] Production Docker setup
- [ ] CI/CD
- [ ] Database backups
- [ ] Redis persistence
- [ ] Monitoring
- [ ] Error tracking
- [ ] Logging
- [ ] Rate limiting
- [ ] Security review
- [ ] Production deployment

---

# 17. Architecture Decisions

## ADR-0001 — Monorepo

Use:

```text
pnpm + Turborepo
```

Reason:

Multiple tightly coupled applications share types, database access, authentication, AI utilities, validation, and configuration.

---

## ADR-0002 — Backend

Use:

```text
Fastify
```

Reason:

Lightweight, performant, TypeScript-friendly, plugin-based architecture, and good fit for an API-heavy SaaS.

---

## ADR-0003 — ORM

Use:

```text
Drizzle ORM
```

Reason:

Atlas is heavily PostgreSQL-oriented and will use pgvector, custom queries, indexes, analytics, and potentially raw SQL. Drizzle keeps the application close to PostgreSQL.

---

## ADR-0004 — Vector Storage

Initial:

```text
PostgreSQL + pgvector
```

Reason:

Keeps the initial infrastructure simple and allows relational and vector data to live together.

A dedicated vector database such as Qdrant or Milvus can be introduced later if real scale requires it.

---

## ADR-0005 — Logging

Use:

```text
Pino
```

Reason:

Fast, structured logging and native integration with Fastify.

---

## ADR-0006 — Customer Frontend

Use:

```text
React + Vite
```

Reason:

The customer dashboard is an authenticated application and does not require SSR.

---

## ADR-0007 — Internal Admin

Use:

```text
Next.js
```

Reason:

The internal admin is a separate application with potentially different requirements and can use Next.js server capabilities where useful.

---

# 18. MVP Definition

Atlas MVP is complete when a customer can:

```text
Register
   │
   ▼
Create Support Bot
   │
   ▼
Add Website
   │
   ▼
Start Crawl
   │
   ▼
Scrape Website
   │
   ▼
Clean Content
   │
   ▼
Chunk Content
   │
   ▼
Generate Embeddings
   │
   ▼
Store in pgvector
   │
   ▼
Ask Questions
   │
   ▼
Retrieve Relevant Content
   │
   ▼
Generate Answer with Groq
   │
   ▼
Test in Dashboard
   │
   ▼
Embed Widget on Website
```

Everything beyond this should be treated as an extension of the MVP rather than a requirement for the first usable version.

```

I've also kept **pgvector as the initial vector store**, rather than adding a dedicated vector database now, and made the customer-facing application explicitly **React + Vite**.
```

## Repository Strategy

- Monorepo: Turborepo + pnpm
- Branch strategy:
  - `main`
  - `staging`
  - `development`
  - `feature/*`
  - `hotfix/*`

## Monorepo Structure

```text
apps/
  api/         # Fastify API
  scraper/     # Playwright + BullMQ workers
  dashboard/   # Customer app (Vite + React + TanStack Router/Query)
  admin/       # Internal admin app
  widget/      # Embedded chat widget

packages/
  ai/          # AI orchestration
  auth/        # Better Auth config
  config/      # Env schema/config
  database/    # Drizzle client/schema
  queue/       # Redis + BullMQ connection and queue contracts
  validation/  # Shared Zod contracts
  types/       # Shared TS types
  logger/      # Logging
  utils/       # Cross-cutting utils
  embeddings/  # Embedding logic
```

## API Structure

The API uses a domain-first modular structure:

```text
apps/api/src/
  app.ts
  index.ts
  config/
  plugins/
  common/
  jobs/
  modules/
    auth/
    orgs/
    websites/
    crawls/
    documents/
    chat/
    usage/
    health/
```

Each module should keep routes, controllers, services, repositories, validation, constants, and types together.

## Frontend Structure

Dashboard/Admin should use:

- React
- TanStack Router
- TanStack Query
- Axios
- Feature-first folder structure

## Boundaries

- auth logic -> `@atlas/auth`
- env/config -> `@atlas/config`
- db/schema -> `@atlas/database`
- redis/queues -> `@atlas/queue`
- shared zod -> `@atlas/validation`
- shared ts types -> `@atlas/types`
