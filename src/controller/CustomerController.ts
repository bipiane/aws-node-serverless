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
   * Usage: curl -X POST -d '{"username":"peter_parker", "name":"Peter Parker","email":"peter@parker.com"}' --url http://localhost:3000/api/v1/customers
   * @param {*} event
   * @param context
   */
  async create(event: APIGatewayProxyEvent, context?: Context): Promise<APIGatewayProxyResult> {
    console.log('functionName', context.functionName);
    try {
      const body: CreateCustomerDTO = JSON.parse(
        event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body,
      );

      //@TODO schema validation should be done using AWS ApiGateway openapi https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html
      if (!body?.username || !body?.email || !body?.name) {
        return new ResponseData({error: 'Email and name are required.'}, StatusCode.CONFLICT);
      }
      body.username = body?.username?.toLowerCase();
      body.email = body?.email?.toLowerCase();

      if (await this.customerService.existsCustomer(body.username)) {
        return new ResponseData({error: `Customer '${body.username}' already created.`}, StatusCode.CONFLICT);
      }

      const existsEmail = await this.customerService.findCustomer({email: body.email});
      if (existsEmail && existsEmail.enabled === true) {
        return new ResponseData({error: `Customer with email '${body.email}' already created.`}, StatusCode.CONFLICT);
      }

      const newCustomer: CustomerDB = {
        username: body.username,
        email: body.email,
        name: body.name,
        enabled: true,
      };

      await this.customerService.createCustomer(newCustomer);

      const bodyResult = {
        message: `Customer '${body.username}' created.`,
      };

      return new ResponseData(bodyResult, StatusCode.CREATED);
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error creating customer.`}, StatusCode.INTERNAL_ERROR);
    }
  }

  /**
   * Gets a customer by username
   * @param event
   * @param _context
   */
  async get(event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    // Throw test exception
    if (event?.queryStringParameters?.alert_status === 'alarm') {
      throw new Error('Error test lambada!');
    }
    const username = event.pathParameters.username?.toLowerCase();

    try {
      const customer = await this.customerService.findCustomer({
        username: username,
      });

      if (!customer) {
        return new ResponseData({error: `Customer '${username}' not found.`}, StatusCode.NOT_FOUND);
      }

      return new ResponseData(customer);
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error querying customers.`}, StatusCode.INTERNAL_ERROR);
    }
  }

  /**
   * Gets all customers
   * @param _event
   * @param _context
   */
  async getAll(_event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    // Throw test exception
    if (_event?.queryStringParameters?.alert_status === 'alarm') {
      throw new Error('Error test lambada!');
    }

    try {
      const bodyResult = await this.customerService.findAllCustomers();
      return new ResponseData(bodyResult);
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error querying customers.`}, StatusCode.INTERNAL_ERROR);
    }
  }

  /**
   * Disables a customer by username
   * @param event
   * @param _context
   */
  async delete(event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    try {
      const username = event.pathParameters.username?.toLowerCase();

      const disabled = await this.customerService.disableCustomer(username);

      if (!disabled) {
        return new ResponseData({error: `Customer '${username}' not found.`}, StatusCode.NOT_FOUND);
      }

      return new ResponseData({message: `Customer '${username}' disabled`});
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error disabling customer.`}, StatusCode.INTERNAL_ERROR);
    }
  }
}
