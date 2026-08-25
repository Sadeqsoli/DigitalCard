import { v7 as uuidv7 } from 'uuid';

/** Creates an RFC 9562 UUIDv7 for a DigitalCard-owned business entity. */
export function createId(): string {
  return uuidv7();
}
