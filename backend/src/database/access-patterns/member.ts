import { DynamoDB } from 'aws-sdk';
import { Member, memberRecord, memberTypeGuard } from '../records/member';

const dynamoDb = new DynamoDB.DocumentClient();
const TableName = String(process.env.tableName);

type responseObject = Member | null;

export const joinRoom = async (
  roomId: string,
  connectionId: string
): Promise<responseObject> => {
  const member = memberRecord(roomId, connectionId);

  try {
    await dynamoDb
      .put({
        TableName,
        Item: member,
        ReturnValues: 'ALL_OLD',
      })
      .promise();
    return member;
  } catch (e) {
    console.error('Error joining room', e);
  }
  return null;
};

export const leaveRoom = async (
  roomId: string,
  connectionId: string
): Promise<responseObject> => {
  try {
    const { Attributes } = await dynamoDb
      .delete({
        TableName,
        Key: {
          pk: roomId,
          sk: `MEMBER#${connectionId}`,
        },
        ReturnValues: 'ALL_OLD',
      })
      .promise();

    if (memberTypeGuard(Attributes)) {
      return Attributes;
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error leaving room', e);
    return null;
  }
};

export const getRoomMembers = async (
  roomId: string
): Promise<Member[] | null> => {
  try {
    const { Items } = await dynamoDb
      .query({
        TableName,
        KeyConditionExpression: '#pk = :roomId and #sk begins_with(:member)',
        ExpressionAttributeNames: {
          '#pk': 'pk',
          '#sk': 'sk',
        },
        ExpressionAttributeValues: {
          ':roomId': roomId,
          ':member': 'MEMBER#',
        },
      })
      .promise();

    const filteredItems =
      Items && Items.filter((item) => memberTypeGuard(item));

    if (filteredItems) {
      return filteredItems as Member[];
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error leaving room', e);
    return null;
  }
};
