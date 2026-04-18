import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.USERS_TABLE;
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Content-Type': 'application/json',
};

const ok = (body, status = 200) => ({ statusCode: status, headers: CORS, body: JSON.stringify(body) });
const err = (msg, status = 500) => ok({ error: msg }, status);

function claimsFrom(event) {
  return event?.requestContext?.authorizer?.jwt?.claims || null;
}

function resolveUsername(claims) {
  if (claims.nickname) return claims.nickname;
  if (claims.name) return claims.name;
  if (claims.email?.includes('@')) return claims.email.split('@')[0];
  return `user-${Math.abs([...claims.sub].reduce((a, c) => a * 31 + c.charCodeAt(0), 0))}`;
}

async function upsertUser(claims) {
  const existing = await doc.send(new GetCommand({ TableName: TABLE, Key: { auth0Subject: claims.sub } }));
  if (existing.Item) return existing.Item;

  const user = {
    auth0Subject: claims.sub,
    username: resolveUsername(claims),
    email: claims.email || null,
    pictureUrl: claims.picture || null,
    createdAt: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLE, Item: user }));
  return user;
}

export const handler = async (event) => {
  try {
    const claims = claimsFrom(event);
    if (!claims?.sub) return err('Unauthorized', 401);

    const user = await upsertUser(claims);
    return ok(user);
  } catch (e) {
    console.error('users-service error', e);
    return err(e.message || 'Internal error');
  }
};
