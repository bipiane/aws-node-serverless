import {CreateCustomerDTO, CustomerListDB} from '../src/model/Customer';

const createCustomer: CreateCustomerDTO = {
  name: 'Tony Stark',
  username: 'tonystark',
  email: 'tony@stark.com',
};
const createCustomerError = new Error('test error saving customer');

const findAllCustomers: CustomerListDB = {
  total: 2,
  items: [
    {
      name: 'Peter Parker',
      username: 'peterparker',
      email: 'peter@parker.com',
      enabled: true,
    },
    {
      name: 'Tony Stark',
      username: 'tonystark',
      email: 'tony@stark.com',
      enabled: false,
    },
  ],
};

const findAllCustomersError = new Error('test find error');

const disableCustomerError = new Error('test error updating customer');

export default {
  createCustomer,
  createCustomerError,
  findAllCustomers,
  findAllCustomersError,
  disableCustomerError,
};
