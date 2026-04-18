# Architecture

## Phase 1 — Spring Boot monolith

```mermaid
flowchart LR
    U[User Browser] -->|OIDC redirect| A[Auth0]
    U -->|1. Login| A
    A -->|2. ID + Access Token JWT| U
    U -->|3. API calls w/ Bearer JWT| F[React SPA]
    F -->|4. REST + JWT| M[Spring Boot Monolith<br/>OAuth2 Resource Server]
    M -->|5. validates JWT via JWKS| A
    M --> DB[(H2 / Postgres)]
```

- Single Spring Boot app exposing `/api/posts`, `/api/stream`, `/api/me`.
- All endpoints share one process, one datasource, one deployment.
- Swagger UI at `/swagger-ui.html` documents the OpenAPI spec.

## Phase 2 — Serverless microservices

```mermaid
flowchart LR
    U[User Browser] -->|1. Login via Auth0 SPA SDK| A[Auth0]
    A -->|JWT access token| U
    U -->|static hosting| S3[(S3 public bucket<br/>React SPA)]
    U -->|2. REST + Bearer JWT| G[API Gateway HTTP API<br/>JWT Authorizer -> Auth0]

    G -->|GET /api/me| UF[Users Lambda]
    G -->|POST /api/posts| PF[Posts Lambda]
    G -->|GET /api/stream, /api/posts| SF[Stream Lambda]

    UF --> UT[(DynamoDB<br/>UsersTable)]
    PF --> UT
    PF --> PT[(DynamoDB<br/>PostsTable)]
    SF --> PT
```

- API Gateway validates JWT before invoking any protected Lambda — the Lambda never needs to verify the signature.
- Three independent services, each with its own deployment unit and IAM scope.
- DynamoDB tables are private to their owning services (Users table is read/written by Users and Posts services only; Stream is read-only).

## Security flow

```mermaid
sequenceDiagram
    participant Browser
    participant SPA as React SPA (Auth0 React SDK)
    participant Auth0
    participant API as API Gateway / Spring Boot
    participant DB

    Browser->>SPA: open site
    SPA->>Auth0: /authorize (PKCE, audience=API)
    Auth0-->>SPA: Access Token (JWT, scoped)
    SPA->>API: GET /api/stream  (public)
    API-->>SPA: posts[]
    SPA->>API: POST /api/posts  (Authorization: Bearer JWT)
    API->>Auth0: JWKS (cached) -> validate sig, iss, aud, exp
    API->>DB: insert Post
    API-->>SPA: 201 Created
```

## Why three microservices?

- **Users**: isolates identity concerns (user profile, upsert on first login). Can later add avatar upload, preferences, etc.
- **Posts**: write path for the protected `POST /api/posts`. Enforces the 140-char rule and writes to the posts table.
- **Stream**: read path for the public feed. Pure DynamoDB query, no JWT validation — cheap and horizontally scalable.

This split matches natural read/write separation and allows the stream service to scale independently of writes (which are rarer).
