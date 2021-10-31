import { APIGatewayProxyHandler } from 'aws-lambda';
import { pino } from 'pino';
import {
  getRoomMembers,
  joinRoom,
  leaveRoom,
  upsertRoom,
} from '../database/access-patterns';

export const logger = pino({
  name: 'coin-cubes',
  level: 'debug',
});

export const connect: APIGatewayProxyHandler = async (event) => {
  logger.info('Started processing websocket request to connect');

  const { connectionId } = event.requestContext;

  const room = await upsertRoom('example');
  if (room && connectionId) {
    await joinRoom(room?.pk, connectionId);
  }

  return { statusCode: 200, body: 'Joined room' };
};

export const disconnect: APIGatewayProxyHandler = async (event) => {
  logger.info('Started processing websocket request to connect');

  const { connectionId } = event.requestContext;

  const room = await upsertRoom('example');
  if (room && connectionId) {
    await leaveRoom(room?.pk, connectionId);
  }

  return { statusCode: 200, body: 'Left room' };
};

export const sendMessage: APIGatewayProxyHandler = async (event) => {
  const members = await getRoomMembers('example');

  logger.info({ members }, 'Fetched room members');

  return { statusCode: 200, body: 'Message sent' };
};
