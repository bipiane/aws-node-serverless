import {ScanCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';
import {GetItemInput} from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import {PutCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand';
import {UpdateCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/UpdateCommand';
import {CustomerDB} from '../model/Customer';
import DynamoDBClient from './dynamodb';

export interface IDatabase {
  findOne(primaryKey: string, options?: any): Promise<any>;

  findAndCount(options?: any): Promise<[any[], number]>;

  save(data: object): Promise<boolean>;

  update(primaryKey: string, updateData: object): Promise<boolean>;
}

export class CustomerDynamoDB implements IDatabase {
  private readonly tableName: string;

  constructor() {
    this.tableName = process.env.DYNAMODB_CUSTOMER_TABLE;
  }

  async findOne(primaryKey: string, options?: Pick<GetItemInput, 'ProjectionExpression'>): Promise<CustomerDB> {
    const customer = await DynamoDBClient.get({
      TableName: this.tableName,
      Key: {
        email: primaryKey,
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
          email: customer.email,
          name: customer.name,
          enabled: customer.enabled || false,
        };
      }),
      result.Count,
    ];
  }

  async save(data: CustomerDB): Promise<boolean> {
    const putParams: PutCommandInput = {
      TableName: this.tableName,
      Item: data,
    };
    await DynamoDBClient.put(putParams);
    return true;
  }

  async update(email: string, updateData: Partial<CustomerDB>): Promise<boolean> {
    const updatesAttr: Pick<UpdateCommandInput, 'AttributeUpdates'> = {};
    Object.entries(updateData).map((e: [string, any]) => {
      updatesAttr[e[0]] = {Value: e[1]};
    });

    const updateParams: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        email: email,
      },
      AttributeUpdates: updatesAttr,
    };

    await DynamoDBClient.update(updateParams);
    return true;
  }
}
