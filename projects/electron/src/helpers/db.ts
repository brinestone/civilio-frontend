import { MalConfigurationError, TestDbConnectionRequest } from '@civilio/shared';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client, Pool } from 'pg';
import { usePrefs } from './store';

let pool: Pool | null = null;

export async function testConnection({ database, host, password, port, ssl, username }: TestDbConnectionRequest) {
  const client = new Client({
    user: username,
    host,
    database,
    password,
    port,
    ssl
  });
  const url = new URL(`/${database}`, `postgresql://${username}:redacted@${host}:${port}`);
  if (ssl) url.searchParams.set('sslmode', 'required');

  console.log(`Testing database on host: ${host} using ${url.toString()}...`);
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`Database time is ${res.rows[0].now}`);
    return true;
  } catch (ex) {
    console.log(`Test connection: ${url} failed`);
    console.error(ex);
    return ex.message;
  } finally {
    await client.end();
  }
}

export function resetPool() {
  const prefs = usePrefs();
  if (!prefs.db) {
    throw new MalConfigurationError('db');
  }
  const { host, password, port, ssl, username, database } = prefs.db;
  const url = new URL(`${database}`, `postgresql://${username}:${password}@${host}:${port}`);
  if (ssl) {
    url.searchParams.set('sslmode', 'require');
  }
  pool = new Pool({
    connectionString: url.toString()
  });
}

export function provideDatabase(schema: Record<string, unknown>) {
  const prefs = usePrefs();
  if (!prefs.db) {
    throw new MalConfigurationError('db');
  }
  if (pool == null) {
    const { host, password, port, ssl, username, database } = prefs.db;
    const url = new URL(`${database}`, `postgresql://${username}:${password}@${host}:${port}`);
    if (ssl) {
      url.searchParams.set('sslmode', 'require');
    }
    pool = new Pool({
      connectionString: url.toString()
    });
  }
  return drizzle(pool, { schema });
}
