import {CustomerDB, CustomerListDB} from '../model/Customer';
import {CustomerDynamoDB, IDatabase} from './database';
import {GetItemInput} from '@aws-sdk/client-dynamodb/dist-types/models/models_0';
import {QueryCommandInput, QueryCommandOutput} from '@aws-sdk/lib-dynamodb/dist-types/commands/QueryCommand';

export class CustomerService {
  private database: IDatabase;

  constructor() {
    this.database = new CustomerDynamoDB();
  }

  /**
   * Creates a new customer
   * @param params
   */
  async createCustomer(params: CustomerDB): Promise<boolean> {
    try {
      await this.database.save(params);
      return true;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Find a customer by UUID
   * @param uuid
   * @param options
   */
  async findCustomer(uuid: string, options?: Pick<GetItemInput, 'ProjectionExpression'>): Promise<CustomerDB> {
    try {
      return await this.database.findOne(uuid, options);
    } catch (err) {
      console.error('Error CustomerService.findCustomer: ', err);
      throw err;
    }
  }

  /**
   * Gets a customer by username or email
   * @param search
   * @param options
   */
  async searchCustomer(
    search: {
      username?: string;
      email?: string;
    },
    options?: Pick<GetItemInput, 'ProjectionExpression'>,
  ): Promise<CustomerDB> {
    try {
      let customer: CustomerDB = null;

      let queryOptions: QueryCommandInput = null;
      if (search.username) {
        queryOptions = {
          TableName: '-',
          IndexName: 'usernameIndex',
          KeyConditionExpression: 'username = :v_data',
          ExpressionAttributeValues: {
            ':v_data': search.username,
          },
          ProjectionExpression: options.ProjectionExpression,
          Limit: 1,
        };
      } else if (search.email) {
        queryOptions = {
          TableName: '-',
          IndexName: 'emailIndex',
          KeyConditionExpression: 'email = :v_data',
          ExpressionAttributeValues: {
            ':v_data': search.email,
          },
          ProjectionExpression: options.ProjectionExpression,
          Limit: 1,
        };
      }

      if (queryOptions !== null) {
        const result: QueryCommandOutput = await this.database.query(queryOptions);
        customer = result.Items[0] as CustomerDB;
      }

      return customer;
    } catch (err) {
      console.error('Error CustomerService.findCustomer: ', err);
      throw err;
    }
  }

  /**
   * Checks if exists customer by username or email, and it's enabled
   * @param search
   */
  async existsCustomer(search: {username: string; email: string}): Promise<boolean> {
    try {
      // Search customers by username
      let customer = await this.searchCustomer(
        {username: search.username},
        {
          ProjectionExpression: 'enabled',
        },
      );
      if (customer && customer.enabled === true) {
        return true;
      }
      // Search customers by email
      customer = await this.searchCustomer(
        {email: search.email},
        {
          ProjectionExpression: 'enabled',
        },
      );
      return customer && customer.enabled === true;
    } catch (err) {
      console.error('Error CustomerService.existsCustomer: ', err);
      throw err;
    }
  }

  /**
   * Gets all customers
   */
  async findAllCustomers(): Promise<CustomerListDB> {
    try {
      const result = await this.database.findAndCount();

      return {
        items: result[0],
        total: result[1],
      };
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Disables a customer by uuid
   * @param uuid
   */
  async disableCustomer(uuid: string): Promise<boolean> {
    try {
      await this.database.update(uuid, {enabled: false});
      return true;
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') {
        return false;
      } else {
        console.error(err);

        throw err;
      }
    }
  }
}
