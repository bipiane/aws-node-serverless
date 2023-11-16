import {CustomerDB, CustomerListDB} from '../model/Customer';
import {CustomerDynamoDB, IDatabase} from './database';

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
   * Checks if exists customer by username and it's enabled
   * @param username
   */
  async existsCustomer(username: string): Promise<boolean> {
    try {
      const customer = await this.database.findOne(username, {
        ProjectionExpression: 'enabled',
      });
      return customer && customer.enabled === true;
    } catch (err) {
      console.error('Error CustomerService.existsCustomer: ', err);
      throw err;
    }
  }

  async findCustomer(search: {username?: string; email?: string}): Promise<CustomerDB> {
    try {
      let customer = null;
      if (search.username) {
        customer = (
          await this.database.get({
            Key: {
              username: search.username,
            },
          })
        ).Item;
      } else if (search.email) {
        customer = (
          await this.database.query({
            IndexName: 'emailIndex',
            KeyConditionExpression: 'email = :v_email',
            ExpressionAttributeValues: {
              ':v_email': search.email,
            },
          })
        )[0][0];
      }

      return customer;
    } catch (err) {
      console.error('Error CustomerService.findCustomer: ', err);
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
   * Disables a customer by username
   * @param username
   */
  async disableCustomer(username: string): Promise<boolean> {
    try {
      await this.database.update(username, {enabled: false});
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
