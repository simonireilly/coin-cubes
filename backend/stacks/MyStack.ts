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
        id: TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'id' },
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
        // $default: 'src/default.main',
        // $disconnect: 'src/disconnect.main',
        // sendMessage: 'src/send-message.main',
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
