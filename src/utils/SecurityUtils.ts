import ShortUniqueId from 'short-unique-id';

/**
 * Gets a random and probably unique UUID
 */
export function getRandomUUID(): string {
  const uuid = new ShortUniqueId();
  return uuid.randomUUID(10);
}

export default {
  getRandomUUID,
};
