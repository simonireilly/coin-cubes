import { RemovalPolicy } from '@aws-cdk/core';
import {
  App,
  Stack,
  StackProps,
  Table,
  TableFieldType,
  WebSocketApi,
} from '@serverless-stack/resources';

export default class MyStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create the table
    const table = new Table(this, 'Connections', {
      fields: {
        pk: TableFieldType.STRING,
        sk: TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
      dynamodbTable: {
        removalPolicy: RemovalPolicy.DESTROY,
      },
    });

    // Create the websocket API
    const api = new WebSocketApi(this, 'Api', {
      defaultFunctionProps: {
        environment: {
          tableName: table.dynamodbTable.tableName,
        },
      },
      routes: {
        $connect: 'src/sockets/index.connect',
        $disconnect: 'src/sockets/index.disconnect',
        sendMessage: 'src/sockets/index.sendMessage',
        // $default: 'src/default.main',
      },
    });

    // Allow the API to access the table
    api.attachPermissions([table.dynamodbTable]);

    // Show the endpoint in the output
    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
