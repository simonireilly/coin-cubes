import AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { pino } from 'pino';

export const logger = pino({
  name: 'coin-cubes',
  level: 'debug',
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const connect: APIGatewayProxyHandler = async (event) => {
  logger.info('Started processing websocket request to connect');

  const { connectedAt, connectionId, routeKey, messageDirection } =
    event.requestContext;

  const params = {
    TableName: String(process.env.tableName),
    Item: {
      id: connectionId,
      connection: {
        connectionId,
        connectedAt,
        routeKey,
        messageDirection,
      },
    },
  };

  await dynamoDb.put(params).promise();

  return { statusCode: 200, body: 'Connected' };
};
