import { DynamoDB } from 'aws-sdk';
import { Room, roomRecord, roomTypeGuard } from '../records/room';

const dynamoDb = new DynamoDB.DocumentClient();
const TableName = String(process.env.tableName);

type responseObject = Room | null;

export const upsertRoom = async (roomId: string): Promise<responseObject> => {
  const room = roomRecord(roomId);

  try {
    await dynamoDb
      .put({
        TableName,
        Item: room,
        ReturnValues: 'NONE',
      })
      .promise();
    return room;
  } catch (e) {
    return null;
  }
};

export const getRoom = async (roomId: string): Promise<responseObject> => {
  const room = roomRecord(roomId);

  const { Item } = await dynamoDb
    .get({
      TableName,
      Key: room,
    })
    .promise();

  if (roomTypeGuard(Item)) {
    return Item;
  } else {
    return null;
  }
};
