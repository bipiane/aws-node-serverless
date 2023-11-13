import {Handler, Context} from 'aws-lambda';

import {CustomerController} from './controller/CustomerController';

const customerController = new CustomerController();

export const createCustomer: Handler = (event: any, context: Context) => {
  return customerController.create(event, context);
};

export const getAllCustomer: Handler = (event: any) => customerController.getAll(event);

export const deleteCustomer: Handler = (event: any) => customerController.delete(event);
