export interface Room {
  pk: string;
  sk: 'ROOM';
}

export const roomRecord = (roomId: string): Room => ({
  pk: roomId,
  sk: 'ROOM',
});

export const roomTypeGuard = (item: unknown): item is Room => {
  // Should be object not array
  return (
    typeof item === 'object' && item !== null && 'pk' in item && 'sk' in item
  );
};
