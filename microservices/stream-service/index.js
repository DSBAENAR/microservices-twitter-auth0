import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const POSTS = process.env.POSTS_TABLE;
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Content-Type': 'application/json',
};

const ok = (body, status = 200) => ({ statusCode: status, headers: CORS, body: JSON.stringify(body) });
const err = (msg, status = 500) => ok({ error: msg }, status);

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export const handler = async (event) => {
  try {
    const size = clampInt(event?.queryStringParameters?.size, 20, 1, 100);

    const result = await doc.send(new QueryCommand({
      TableName: POSTS,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': 'POSTS' },
      ScanIndexForward: false,
      Limit: size,
    }));

    const items = (result.Items || []).map((i) => ({
      id: i.id,
      content: i.content,
      authorUsername: i.authorUsername,
      authorPictureUrl: i.authorPictureUrl,
      createdAt: i.createdAt,
    }));

    return ok(items);
  } catch (e) {
    console.error('stream-service error', e);
    return err(e.message || 'Internal error');
  }
};
