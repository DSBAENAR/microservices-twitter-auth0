import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';

const POSTS = process.env.POSTS_TABLE;
const USERS = process.env.USERS_TABLE;
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Content-Type': 'application/json',
};

const ok = (body, status = 200) => ({ statusCode: status, headers: CORS, body: JSON.stringify(body) });
const err = (msg, status = 500, extra = {}) => ok({ error: msg, ...extra }, status);

function claimsFrom(event) {
  return event?.requestContext?.authorizer?.jwt?.claims || null;
}

function resolveUsername(claims) {
  if (claims.nickname) return claims.nickname;
  if (claims.name) return claims.name;
  if (claims.email?.includes('@')) return claims.email.split('@')[0];
  return `user-${Math.abs([...claims.sub].reduce((a, c) => a * 31 + c.charCodeAt(0), 0))}`;
}

async function ensureUser(claims) {
  const existing = await doc.send(new GetCommand({ TableName: USERS, Key: { auth0Subject: claims.sub } }));
  if (existing.Item) return existing.Item;
  const user = {
    auth0Subject: claims.sub,
    username: resolveUsername(claims),
    email: claims.email || null,
    pictureUrl: claims.picture || null,
    createdAt: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: USERS, Item: user }));
  return user;
}

export const handler = async (event) => {
  try {
    const claims = claimsFrom(event);
    if (!claims?.sub) return err('Unauthorized', 401);

    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return err('Invalid JSON body', 400); }

    const content = (body.content || '').trim();
    if (!content) return err('content is required', 400);
    if (content.length > 140) return err('content exceeds 140 characters', 400);

    const author = await ensureUser(claims);
    const now = new Date().toISOString();
    const item = {
      pk: 'POSTS',
      sk: `${now}#${randomUUID()}`,
      id: randomUUID(),
      content,
      authorSubject: author.auth0Subject,
      authorUsername: author.username,
      authorPictureUrl: author.pictureUrl,
      createdAt: now,
    };
    await doc.send(new PutCommand({ TableName: POSTS, Item: item }));

    return ok(item, 201);
  } catch (e) {
    console.error('posts-service error', e);
    return err(e.message || 'Internal error');
  }
};
