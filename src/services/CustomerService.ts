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
   * Checks if exists customer by email and it's enabled
   * @param email
   */
  async existsCustomer(email: string): Promise<boolean> {
    try {
      const customer = await this.database.findOne(email, {
        ProjectionExpression: 'enabled',
      });
      return customer && customer.enabled === true;
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
   * Disables a customer by email
   * @param email
   * @protected
   */
  async disableCustomer(email: string): Promise<boolean> {
    try {
      await this.database.update(email, {enabled: false});
      return true;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }
}
