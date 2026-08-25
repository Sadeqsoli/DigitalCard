import { timestamp } from 'drizzle-orm/pg-core';

export function timestampWithTimeZone(name: string) {
  return timestamp(name, {
    mode: 'date',
    withTimezone: true,
  });
}
