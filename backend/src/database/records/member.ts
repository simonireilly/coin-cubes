export interface Member {
  pk: string;
  sk: `MEMBER#${string}`;
  connectionId: string;
}

export const memberRecord = (roomId: string, connectionId: string): Member => ({
  pk: roomId,
  sk: `MEMBER#${connectionId}`,
  connectionId,
});

export const memberTypeGuard = (item: unknown): item is Member => {
  // Should be object not array
  return (
    typeof item === 'object' &&
    item !== null &&
    'pk' in item &&
    'sk' in item &&
    'connectionId' in item
  );
};
