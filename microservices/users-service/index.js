import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.USERS_TABLE;
const CLAIMS_NAMESPACE = 'https://chirp.baena.cc/';
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,PATCH,OPTIONS',
  'Content-Type': 'application/json',
};

const ok = (body, status = 200) => ({ statusCode: status, headers: CORS, body: JSON.stringify(body) });
const err = (msg, status = 500) => ok({ error: msg }, status);

function claimsFrom(event) {
  return event?.requestContext?.authorizer?.jwt?.claims || null;
}

function claim(claims, name) {
  const plain = claims[name];
  if (plain && String(plain).trim()) return plain;
  return claims[CLAIMS_NAMESPACE + name] || null;
}

function safeHash(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function resolveUsername(claims) {
  const nickname = claim(claims, 'nickname');
  if (nickname) return String(nickname);
  const name = claim(claims, 'name');
  if (name) return String(name);
  const email = claim(claims, 'email');
  if (email && String(email).includes('@')) return String(email).split('@')[0];
  return `user-${safeHash(claims.sub)}`;
}

async function getUser(sub) {
  const res = await doc.send(new GetCommand({ TableName: TABLE, Key: { auth0Subject: sub } }));
  return res.Item || null;
}

async function upsertUser(claims) {
  const existing = await getUser(claims.sub);
  const email = claim(claims, 'email');
  const picture = claim(claims, 'picture');

  if (existing) {
    const updates = {};
    if (email && email !== existing.email) updates.email = email;
    if (picture && picture !== existing.pictureUrl) updates.pictureUrl = picture;
    if (Object.keys(updates).length === 0) return existing;

    const expr = Object.keys(updates).map((k, i) => `#${k} = :${k}`).join(', ');
    const names = Object.fromEntries(Object.keys(updates).map((k) => [`#${k}`, k]));
    const values = Object.fromEntries(Object.entries(updates).map(([k, v]) => [`:${k}`, v]));
    const res = await doc.send(new UpdateCommand({
      TableName: TABLE,
      Key: { auth0Subject: claims.sub },
      UpdateExpression: `SET ${expr}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    }));
    return res.Attributes;
  }

  const user = {
    auth0Subject: claims.sub,
    username: resolveUsername(claims),
    email: email || null,
    pictureUrl: picture || null,
    onboarded: false,
    createdAt: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLE, Item: user }));
  return user;
}

async function updateUsername(sub, username) {
  const res = await doc.send(new UpdateCommand({
    TableName: TABLE,
    Key: { auth0Subject: sub },
    UpdateExpression: 'SET username = :u, onboarded = :o',
    ExpressionAttributeValues: { ':u': username, ':o': true },
    ReturnValues: 'ALL_NEW',
  }));
  return res.Attributes;
}

export const handler = async (event) => {
  try {
    const claims = claimsFrom(event);
    if (!claims?.sub) return err('Unauthorized', 401);

    const method = event.requestContext?.http?.method || event.httpMethod;

    if (method === 'GET') {
      return ok(await upsertUser(claims));
    }

    if (method === 'PATCH') {
      const body = event.body ? JSON.parse(event.body) : {};
      const username = String(body.username || '').trim();
      if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
        return err('Username must be 3-30 chars, letters/digits/underscore only', 400);
      }
      await upsertUser(claims);
      return ok(await updateUsername(claims.sub, username));
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('users-service error', e);
    return err(e.message || 'Internal error');
  }
};
