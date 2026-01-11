import type { Config } from 'drizzle-kit';
import path from 'path';

export default {
  schema: './src/db/habits/schema.ts',
  out: './drizzle/habits',
  dialect: 'sqlite',
  dbCredentials: {
    url: path.join(process.cwd(), 'data', 'habits.db'),
  },
} satisfies Config;
