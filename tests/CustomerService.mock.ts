import {CreateCustomerDTO, CustomerDB, CustomerListDB} from '../src/model/Customer';

const createCustomer: CreateCustomerDTO = {
  name: 'Tony Stark',
  username: 'tonystark',
  email: 'tony@stark.com',
};
const createCustomerError = new Error('test error saving customer');

const findCustomer: CustomerDB = {
  uuid: 'dnJb8Km2La6z',
  name: 'Peter Parker',
  username: 'peterparker',
  email: 'peter@parker.com',
  enabled: true,
};

const findCustomerError = new Error('test find customer error');

const findAllCustomers: CustomerListDB = {
  total: 2,
  items: [
    {
      uuid: '73WakrfVbNJ',
      name: 'Peter Parker',
      username: 'peterparker',
      email: 'peter@parker.com',
      enabled: true,
    },
    {
      uuid: 'mhQtEeDv',
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
  findCustomer,
  findCustomerError,
  findAllCustomers,
  findAllCustomersError,
  disableCustomerError,
};
