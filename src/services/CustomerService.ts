import {CustomerDB, CustomerListDB} from '../model/Customer';
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {PutCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand';
import {ScanCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';
import {UpdateCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/UpdateCommand';
import DynamoDBClient from './dynamodb';

export class CustomerService {
  private readonly tableName: string;
  private customers: DynamoDBDocument;

  constructor() {
    this.tableName = process.env.DYNAMODB_CUSTOMER_TABLE;
    this.customers = DynamoDBClient;
  }

  /**
   * Creates a new customer
   * @param params
   */
  async createCustomer(params: CustomerDB): Promise<boolean> {
    try {
      const putParams: PutCommandInput = {
        TableName: this.tableName,
        Item: params,
      };
      await this.customers.put(putParams);
      return true;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Checks if exists customer by email and it's enabled
   * @param email
   */
  async existsCustomer(email: string): Promise<boolean> {
    try {
      const customer = await DynamoDBClient.get({
        TableName: this.tableName,
        Key: {
          email: email,
        },
        ProjectionExpression: 'enabled',
      });
      return customer.Item && customer.Item.enabled === true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Gets all customers
   */
  async findAllCustomers(): Promise<CustomerListDB> {
    try {
      const scanParams: ScanCommandInput = {
        TableName: this.tableName,
      };

      const result = await DynamoDBClient.scan(scanParams);

      return {
        total: result.Count,
        items: result.Items.map((customer: CustomerDB): CustomerDB => {
          return {
            email: customer.email,
            name: customer.name,
            enabled: customer.enabled || false,
          };
        }),
      };
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Disables a customer by email
   * @param email
   * @protected
   */
  async disableCustomer(email: string): Promise<boolean> {
    try {
      const updateParams: UpdateCommandInput = {
        TableName: this.tableName,
        Key: {
          email: email,
        },
        AttributeUpdates: {
          enabled: {
            Value: false,
          },
        },
      };

      await DynamoDBClient.update(updateParams);
      return true;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }
}
