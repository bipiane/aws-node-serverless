import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {CustomerService} from '../services/CustomerService';
import {CreateCustomerDTO, CustomerDB} from '../model/Customer';
import {ResponseData, StatusCode} from '../utils/messages';
import SecurityUtils from '../utils/SecurityUtils';

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

      const existsCustomer = await this.customerService.existsCustomer({username: body.username, email: body.email});
      if (existsCustomer) {
        return new ResponseData(
          {error: `Customer '${body.username} <${body.email}>' already created.`},
          StatusCode.CONFLICT,
        );
      }

      const newCustomer: CustomerDB = {
        uuid: SecurityUtils.getRandomUUID(),
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
  async show(event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    const uuid = event.pathParameters.uuid;

    try {
      const customer = await this.customerService.findCustomer(uuid);

      if (!customer) {
        return new ResponseData({error: `Customer with uuid '${uuid}' not found.`}, StatusCode.NOT_FOUND);
      }

      return new ResponseData(customer);
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error querying a customer.`}, StatusCode.INTERNAL_ERROR);
    }
  }

  /**
   * Gets all customers
   * @param _event
   * @param _context
   */
  async index(_event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
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
      const uuid = event.pathParameters.uuid;

      const disabled = await this.customerService.disableCustomer(uuid);

      if (!disabled) {
        return new ResponseData({error: `Customer with uuid '${uuid}' not found.`}, StatusCode.NOT_FOUND);
      }

      return new ResponseData({message: `Customer '${uuid}' disabled`});
    } catch (err) {
      console.error(err);
      return new ResponseData({error: `Error disabling customer.`}, StatusCode.INTERNAL_ERROR);
    }
  }
}
