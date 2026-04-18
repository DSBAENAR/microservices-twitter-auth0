# Serverless microservices

Three Node.js 20 Lambda functions behind an API Gateway HTTP API with an Auth0 JWT authorizer.

| Service | Handler | Route | Auth |
|---|---|---|---|
| users-service | `users-service/index.js` | `GET /api/me` | JWT (Auth0) |
| posts-service | `posts-service/index.js` | `POST /api/posts` | JWT (Auth0) |
| stream-service | `stream-service/index.js` | `GET /api/stream`, `GET /api/posts` | Public |

Storage: DynamoDB tables `PostsTable` (pk=`POSTS`, sk=`{isoDate}#{uuid}`) and `UsersTable` (pk=`auth0Subject`).

## Prerequisites

- AWS CLI configured with valid credentials (`aws sts get-caller-identity` must work)
- SAM CLI installed
- Auth0 tenant + API with an audience

## Install dependencies per service

```bash
(cd users-service && npm install --omit=dev)
(cd posts-service && npm install --omit=dev)
(cd stream-service && npm install --omit=dev)
```

## Deploy

```bash
cp samconfig.toml.example samconfig.toml   # fill in Auth0Domain, Auth0Audience, CorsAllowedOrigin
sam build
sam deploy
```

The stack output `ApiUrl` is the base URL to set as `VITE_API_BASE_URL` in the frontend.

## Local invoke

```bash
sam local invoke StreamFunction --event events/stream-get.json
```
