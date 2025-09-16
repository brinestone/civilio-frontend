import { MalConfigurationError } from '@civilio/shared';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { usePrefs } from './store';

let pool: Pool | null = null;
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
