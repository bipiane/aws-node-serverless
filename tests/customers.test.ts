import {APIGatewayProxyResult} from 'aws-lambda';
import lambdaTester from 'lambda-tester';
import {CustomerDB, CustomerListDB} from '../src/model/Customer';
import {CustomerService} from '../src/services/CustomerService';
import {createCustomer, deleteCustomer, getAllCustomers} from '../src/handler';
import CustomerServiceMock from './CustomerService.mock';

jest.mock('../src/services/CustomerService');

describe('create [POST]', () => {
  it('success', () => {
    jest
      .spyOn(CustomerService.prototype, 'existsCustomer')
      .mockImplementation((_username: string): Promise<boolean> => {
        return new Promise(resolve => {
          // it's a new customer
          resolve(false);
        });
      });
    jest.spyOn(CustomerService.prototype, 'createCustomer').mockImplementation((data: CustomerDB): Promise<boolean> => {
      return new Promise(resolve => {
        resolve(data.email === CustomerServiceMock.createCustomer.email && data.enabled);
      });
    });

    return lambdaTester(createCustomer)
      .event({
        body: JSON.stringify({
          name: 'Tony Stark',
          username: 'tonystark',
          email: 'tony@stark.com',
        }),
      })
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(201);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
          message: `Customer 'tonystark' created.`,
        });
      });
  });

  it('error: customer already created', () => {
    jest.spyOn(CustomerService.prototype, 'existsCustomer').mockImplementation((username: string): Promise<boolean> => {
      return new Promise(resolve => {
        // it isn't a new customer
        resolve(username === 'tonystark');
      });
    });

    return lambdaTester(createCustomer)
      .event({
        body: JSON.stringify({
          name: 'Tony Stark',
          username: 'TONYSTARK',
          email: 'TONY@STARK.com',
        }),
      })
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(409);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Customer 'tonystark' already created.`});
      });
  });

  it('error: email and name are required', () => {
    jest
      .spyOn(CustomerService.prototype, 'existsCustomer')
      .mockImplementation((_username: string): Promise<boolean> => {
        return new Promise(resolve => {
          // it's a new customer
          resolve(false);
        });
      });

    return lambdaTester(createCustomer)
      .event({
        body: JSON.stringify({
          name: '',
          email: '',
        }),
      })
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(409);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: 'Email and name are required.'});
      });
  });

  it('error: saving customer', () => {
    jest
      .spyOn(CustomerService.prototype, 'existsCustomer')
      .mockImplementation((_username: string): Promise<boolean> => {
        return new Promise(resolve => {
          // it's a new customer
          resolve(false);
        });
      });
    jest
      .spyOn(CustomerService.prototype, 'createCustomer')
      .mockImplementation((_data: CustomerDB): Promise<boolean> => {
        throw CustomerServiceMock.createCustomerError;
      });

    return lambdaTester(createCustomer)
      .event({
        body: JSON.stringify({
          name: 'Tony Stark',
          username: 'tonystark',
          email: 'tony@stark.com',
        }),
      })
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(500);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Error creating customer.`});
      });
  });
});

describe('getAll [GET]', () => {
  it('success', () => {
    jest.spyOn(CustomerService.prototype, 'findAllCustomers').mockImplementation((): Promise<CustomerListDB> => {
      return new Promise(resolve => {
        resolve(CustomerServiceMock.findAllCustomers);
      });
    });

    return lambdaTester(getAllCustomers).expectResult((result: APIGatewayProxyResult) => {
      expect(result.statusCode).toStrictEqual(200);
      const body = JSON.parse(result.body);
      expect(body).toStrictEqual({
        total: 2,
        items: [
          {
            username: 'peterparker',
            email: 'peter@parker.com',
            enabled: true,
            name: 'Peter Parker',
          },
          {
            username: 'tonystark',
            email: 'tony@stark.com',
            enabled: false,
            name: 'Tony Stark',
          },
        ],
      });
    });
  });

  it('error', () => {
    jest.spyOn(CustomerService.prototype, 'findAllCustomers').mockImplementation((): Promise<CustomerListDB> => {
      throw CustomerServiceMock.findAllCustomersError;
    });

    return lambdaTester(getAllCustomers).expectResult((result: APIGatewayProxyResult) => {
      expect(result.statusCode).toStrictEqual(500);
      const body = JSON.parse(result.body);
      expect(body).toStrictEqual({error: `Error querying customers.`});
    });
  });
});

describe('delete [DELETE]', () => {
  it('success', () => {
    jest
      .spyOn(CustomerService.prototype, 'disableCustomer')
      .mockImplementation((username: string): Promise<boolean> => {
        return new Promise(resolve => {
          resolve(username === 'peterparker');
        });
      });

    return lambdaTester(deleteCustomer)
      .event({pathParameters: {username: 'peterparker'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(200);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
          message: `Customer 'peterparker' disabled`,
        });
      });
  });

  it('error', () => {
    jest
      .spyOn(CustomerService.prototype, 'disableCustomer')
      .mockImplementation((_username: string): Promise<boolean> => {
        throw CustomerServiceMock.disableCustomerError;
      });

    return lambdaTester(deleteCustomer)
      .event({pathParameters: {username: 'peterparker'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(500);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Error disabling customer.`});
      });
  });
});
