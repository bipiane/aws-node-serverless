import {ScanCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';
import {GetItemInput} from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import {PutCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand';
import {UpdateCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/UpdateCommand';
import {QueryCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/QueryCommand';
import {GetCommandOutput} from '@aws-sdk/lib-dynamodb/dist-types/commands/GetCommand';
import {CustomerDB} from '../model/Customer';
import DynamoDBClient from './dynamodb';

export interface IDatabase {
  findOne(primaryKey: string, options?: any): Promise<any>;

  findAndCount(options?: any): Promise<[any[], number]>;

  query(options?: any): Promise<[any[], number]>;

  get(options?: any): Promise<any>;

  save(data: object): Promise<boolean>;

  update(partitionKey: string, updateData: object): Promise<boolean>;
}

export class CustomerDynamoDB implements IDatabase {
  private readonly tableName: string;

  constructor() {
    this.tableName = process.env.DYNAMODB_CUSTOMER_TABLE;
  }

  async findOne(primaryKey: string, options?: Pick<GetItemInput, 'ProjectionExpression'>): Promise<CustomerDB> {
    const customer = await this.get({
      TableName: this.tableName,
      Key: {
        username: primaryKey,
      },
      ProjectionExpression: options?.ProjectionExpression,
    });

    return customer.Item as CustomerDB;
  }

  async findAndCount(_options?: object): Promise<[CustomerDB[], number]> {
    const scanParams: ScanCommandInput = {
      TableName: this.tableName,
    };

    const result = await DynamoDBClient.scan(scanParams);

    return [
      result.Items.map((customer: CustomerDB): CustomerDB => {
        return {
          username: customer.username,
          email: customer.email,
          name: customer.name,
          enabled: customer.enabled || false,
        };
      }),
      result.Count,
    ];
  }

  async query(options?: QueryCommandInput): Promise<[any[], number]> {
    const result = await DynamoDBClient.query({
      ...options,
      TableName: this.tableName,
    });

    return [result.Items, result.Count];
  }

  async get(options?: any): Promise<GetCommandOutput> {
    return await DynamoDBClient.get({
      ...options,
      TableName: this.tableName,
    });
  }

  async save(data: CustomerDB): Promise<boolean> {
    const putParams: PutCommandInput = {
      TableName: this.tableName,
      Item: data,
    };
    await DynamoDBClient.put(putParams);
    return true;
  }

  async update(username: string, updateData: Partial<CustomerDB>): Promise<boolean> {
    const updateExpressionList: string[] = [];
    const expressionAttributeNames: UpdateCommandInput['ExpressionAttributeNames'] = {};
    const expressionAttributeValues: UpdateCommandInput['ExpressionAttributeValues'] = {};

    Object.entries(updateData).map((e: [string, any]) => {
      const key: string = e[0];
      const value = e[1];

      const attrMapName = `#${key}Name`;
      const attrMapValue = `:${key}Value`;
      updateExpressionList.push(`SET ${attrMapName} = ${attrMapValue}`); // 'SET #enabledName = :enabledValue'
      expressionAttributeNames[attrMapName] = key; // {'#enabledName': 'enabled'}
      expressionAttributeValues[attrMapValue] = value; // {':enabledValue': false}
    });

    const updateParams: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        username: username,
      },
      UpdateExpression: updateExpressionList.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(username)',
    };

    await DynamoDBClient.update(updateParams);
    return true;
  }
}
