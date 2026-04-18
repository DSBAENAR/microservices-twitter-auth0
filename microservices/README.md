# Serverless microservices

Three Node.js 20 Lambda functions behind an API Gateway HTTP API with an Auth0 JWT authorizer. Infrastructure is defined in `template.yaml` and deployed with AWS SAM.

## Services

| Service | Handler | Routes | Auth |
|---|---|---|---|
| users-service | `users-service/index.js` | `GET /api/me`, `PATCH /api/me` | JWT (Auth0) |
| posts-service | `posts-service/index.js` | `POST /api/posts` | JWT (Auth0) |
| stream-service | `stream-service/index.js` | `GET /api/stream`, `GET /api/posts` | Public |

Storage:
- `PostsTable` — `pk` (HASH) = `POSTS`, `sk` (RANGE) = `{isoDate}#{uuid}`. Single partition is fine for the assignment's write volume; newest-first reads use a descending query on `sk`.
- `UsersTable` — `auth0Subject` (HASH). Item shape: `{ auth0Subject, username, email, pictureUrl, onboarded, createdAt }`.

## Prerequisites

- AWS CLI v2 with valid credentials (`aws sts get-caller-identity` must work)
- SAM CLI 1.157+
- Auth0 tenant + API with an audience configured

## Install dependencies per service

```bash
(cd users-service && npm install --omit=dev)
(cd posts-service && npm install --omit=dev)
(cd stream-service && npm install --omit=dev)
```

## Deploy

```bash
cp samconfig.toml.example samconfig.toml   # fill in Auth0Domain, Auth0Audience, CorsAllowedOrigin, LambdaExecutionRoleArn
sam build
sam deploy
```

`sam deploy` picks up everything from `samconfig.toml`, so no flags are needed after the first run.

### Learner Lab note

The template declares a `LambdaExecutionRoleArn` parameter because AWS Academy Learner Lab forbids creating new IAM roles. Set it to `arn:aws:iam::<ACCOUNT_ID>:role/LabRole` — the role that ships with the sandbox and already grants broad permissions to DynamoDB, CloudWatch Logs, etc.

Example `samconfig.toml` for Learner Lab:

```toml
version = 0.1

[default.deploy.parameters]
stack_name = "twitter-microservices"
region = "us-east-1"
confirm_changeset = false
capabilities = "CAPABILITY_IAM"
resolve_s3 = true
parameter_overrides = "Auth0Domain=\"YOUR-TENANT.us.auth0.com\" Auth0Audience=\"https://twitter-api.YOUR-DOMAIN\" CorsAllowedOrigin=\"https://chirp-frontend-pi.vercel.app\" LambdaExecutionRoleArn=\"arn:aws:iam::<ACCOUNT_ID>:role/LabRole\""
```

The stack output `ApiUrl` is the base URL that goes into `VITE_API_BASE_URL` in the frontend. Current deployment:

```
https://u3yvt8psjk.execute-api.us-east-1.amazonaws.com
```

### Updating CORS after the frontend gets a real URL

The `CorsAllowedOrigin` parameter is read by `AWS::Serverless::HttpApi.CorsConfiguration.AllowOrigins`. Edit `samconfig.toml` with the new origin and re-run `sam deploy`; nothing else is needed.

## Local invoke

```bash
sam local invoke StreamFunction --event events/stream-get.json
```
