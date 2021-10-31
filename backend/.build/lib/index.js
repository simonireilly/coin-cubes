var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// stacks/index.ts
__export(exports, {
  default: () => main
});

// stacks/MyStack.ts
var import_core = __toModule(require("@aws-cdk/core"));
var import_resources = __toModule(require("@serverless-stack/resources"));
var MyStack = class extends import_resources.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const table = new import_resources.Table(this, "Connections", {
      fields: {
        pk: import_resources.TableFieldType.STRING,
        sk: import_resources.TableFieldType.STRING
      },
      primaryIndex: { partitionKey: "pk", sortKey: "sk" },
      dynamodbTable: {
        removalPolicy: import_core.RemovalPolicy.DESTROY
      }
    });
    const api = new import_resources.WebSocketApi(this, "Api", {
      defaultFunctionProps: {
        environment: {
          tableName: table.dynamodbTable.tableName
        }
      },
      routes: {
        $connect: "src/sockets/index.connect",
        $disconnect: "src/sockets/index.disconnect",
        sendMessage: "src/sockets/index.sendMessage"
      }
    });
    api.attachPermissions([table.dynamodbTable]);
    this.addOutputs({
      ApiEndpoint: api.url
    });
  }
};

// stacks/index.ts
function main(app) {
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });
  new MyStack(app, "my-stack");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=index.js.map
