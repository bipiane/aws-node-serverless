import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {CustomerService} from '../services/CustomerService';
import {CreateCustomerDTO, CustomerDB} from '../model/Customer';
import {ResponseData, StatusCode} from '../utils/messages';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  /**
   * Creates a new customer.
   * Usage: curl -X POST -d '{"name":"Peter Parker","email":"peter@parker.com"}' --url http://localhost:3000/api/v1/customers
   * @param {*} event
   * @param context
   */
  async create(event: APIGatewayProxyEvent, context?: Context): Promise<APIGatewayProxyResult> {
    console.log('functionName', context.functionName);
    try {
      const body: CreateCustomerDTO = JSON.parse(
        event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body,
      );

      if (!body?.email || !body?.name) {
        return new ResponseData({error: 'Email and name are required.'}, StatusCode.CONFLICT);
      }
      body.email = body?.email?.toLowerCase();

      if (await this.customerService.existsCustomer(body.email)) {
        return new ResponseData({error: `Customer '${body.email}' already created.`}, StatusCode.CONFLICT);
      }

      const newCustomer: CustomerDB = {
        email: body.email,
        name: body.name,
        enabled: true,
      };

      await this.customerService.createCustomer(newCustomer);

      const bodyResult = {
        message: `Customer '${body.email}' created.`,
      };

      return new ResponseData(bodyResult, StatusCode.CREATED);
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error creating customer.`}, StatusCode.INTERNAL_ERROR);
    }
  }

  /**
   * Gets all customers
   * @param _event
   * @param _context
   */
  async getAll(_event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    try {
      const bodyResult = await this.customerService.findAllCustomers();
      return new ResponseData(bodyResult);
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error querying customers.`}, StatusCode.INTERNAL_ERROR);
    }
  }

  /**
   * Disables a customer by email
   * @param event
   * @param _context
   */
  async delete(event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    const customerEmail = event.pathParameters.email?.toLowerCase();

    await this.customerService.disableCustomer(customerEmail);

    const bodyResult = {
      message: `Customer '${customerEmail}' disabled`,
    };

    return new ResponseData(bodyResult);
  }
}
