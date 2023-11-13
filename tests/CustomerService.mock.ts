import {CreateCustomerDTO, CustomerListDB} from '../src/model/Customer';

const createCustomer: CreateCustomerDTO = {
  name: 'Tony Stark',
  email: 'tony@stark.com',
};
const createCustomerError = new Error('test error saving customer');

const findAllCustomers: CustomerListDB = {
  total: 2,
  items: [
    {
      name: 'Peter Parker',
      email: 'peter@parker.com',
      enabled: true,
    },
    {
      name: 'Tony Stark',
      email: 'tony@stark.com',
      enabled: false,
    },
  ],
};

const findAllCustomersError = new Error('test find error');

export default {
  createCustomer,
  createCustomerError,
  findAllCustomers,
  findAllCustomersError,
};
