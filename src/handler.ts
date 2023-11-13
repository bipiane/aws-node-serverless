import {Handler, Context, APIGatewayProxyEvent} from 'aws-lambda';

import {CustomerController} from './controller/CustomerController';

const customerController = new CustomerController();

export const createCustomer: Handler = (event: APIGatewayProxyEvent, context: Context) => {
  return customerController.create(event, context);
};

export const getAllCustomer: Handler = (event: APIGatewayProxyEvent) => customerController.getAll(event);

export const deleteCustomer: Handler = (event: APIGatewayProxyEvent) => customerController.delete(event);
