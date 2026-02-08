import { ArchaeologyTeam } from './types';

interface D1Response<T> {
  result: Array<{
    results: T[];
    success: boolean;
    meta: Record<string, unknown>;
  }>;
  success: boolean;
  errors: Array<{ message: string }>;
}

async function queryD1<T>(sql: string, params: string[] = []): Promise<T[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  const missing = [
    !accountId && 'CLOUDFLARE_ACCOUNT_ID',
    !databaseId && 'CLOUDFLARE_D1_DATABASE_ID',
    !apiToken && 'CLOUDFLARE_API_TOKEN',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing env variables: ${missing.join(', ')}. Add them to .env.local`);
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D1 query failed: ${response.status} ${errorText}`);
  }

  const data: D1Response<T> = await response.json();

  if (!data.success) {
    throw new Error(`D1 query error: ${data.errors.map((e) => e.message).join(', ')}`);
  }

  return data.result[0]?.results ?? [];
}

export async function findTeam(
  location: string,
  objectType: string
): Promise<ArchaeologyTeam | null> {
  const results = await queryD1<ArchaeologyTeam>(
    'SELECT * FROM archaeology_teams WHERE location = ? AND object_type = ?',
    [location, objectType]
  );

  return results[0] ?? null;
}

export async function logUpload(params: {
  location: string;
  confidenceThreshold: number;
  objectDetected: string | null;
  objectConfidence: number | null;
  teamMatched: string | null;
  errorType: string | null;
}): Promise<void> {
  await queryD1(
    `INSERT INTO upload_logs (location, confidence_threshold, object_detected, object_confidence, team_matched, error_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      params.location,
      String(params.confidenceThreshold),
      params.objectDetected ?? '',
      String(params.objectConfidence ?? 0),
      params.teamMatched ?? '',
      params.errorType ?? '',
    ]
  );
}