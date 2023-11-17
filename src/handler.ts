import {Handler, Context, APIGatewayProxyEvent} from 'aws-lambda';

import {CustomerController} from './controller/CustomerController';
import {AuthController} from './controller/AuthController';

const authController = new AuthController();

export const signup: Handler = (event: APIGatewayProxyEvent, context: Context) => {
  return authController.signup(event, context);
};
export const login: Handler = (event: APIGatewayProxyEvent, context: Context) => {
  return authController.login(event, context);
};

const customerController = new CustomerController();

export const createCustomer: Handler = (event: APIGatewayProxyEvent, context: Context) => {
  return customerController.create(event, context);
};

export const getCustomer: Handler = (event: APIGatewayProxyEvent) => customerController.show(event);

export const getAllCustomers: Handler = (event: APIGatewayProxyEvent) => customerController.index(event);

export const deleteCustomer: Handler = (event: APIGatewayProxyEvent) => customerController.delete(event);
