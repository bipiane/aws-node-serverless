import {APIGatewayProxyResult} from 'aws-lambda';
import lambdaTester from 'lambda-tester';
import {CustomerDB, CustomerListDB} from '../src/model/Customer';
import {CustomerService} from '../src/services/CustomerService';
import {createCustomer, deleteCustomer, getAllCustomer} from '../src/handler';
import CustomerServiceMock from './CustomerService.mock';

jest.mock('../src/services/CustomerService');

describe('create [POST]', () => {
  it('success', () => {
    jest.spyOn(CustomerService.prototype, 'existsCustomer').mockImplementation((_email: string): Promise<boolean> => {
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
          email: 'tony@stark.com',
        }),
      })
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(201);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
          message: `Customer 'tony@stark.com' created.`,
        });
      });
  });

  it('error: customer already created', () => {
    jest.spyOn(CustomerService.prototype, 'existsCustomer').mockImplementation((email: string): Promise<boolean> => {
      return new Promise(resolve => {
        // it isn't a new customer
        resolve(email === 'tony@stark.com');
      });
    });

    return lambdaTester(createCustomer)
      .event({
        body: JSON.stringify({
          name: 'Tony Stark',
          email: 'TONY@STARK.com',
        }),
      })
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(409);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Customer 'tony@stark.com' already created.`});
      });
  });

  it('error: email and name are required', () => {
    jest.spyOn(CustomerService.prototype, 'existsCustomer').mockImplementation((_email: string): Promise<boolean> => {
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
    jest.spyOn(CustomerService.prototype, 'existsCustomer').mockImplementation((_email: string): Promise<boolean> => {
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

    return lambdaTester(getAllCustomer).expectResult((result: APIGatewayProxyResult) => {
      expect(result.statusCode).toStrictEqual(200);
      const body = JSON.parse(result.body);
      expect(body).toStrictEqual({
        total: 2,
        items: [
          {
            email: 'peter@parker.com',
            enabled: true,
            name: 'Peter Parker',
          },
          {
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

    return lambdaTester(getAllCustomer).expectResult((result: APIGatewayProxyResult) => {
      expect(result.statusCode).toStrictEqual(500);
      const body = JSON.parse(result.body);
      expect(body).toStrictEqual({error: `Error querying customers.`});
    });
  });
});

describe('delete [DELETE]', () => {
  it('success', () => {
    jest.spyOn(CustomerService.prototype, 'disableCustomer').mockImplementation((email: string): Promise<boolean> => {
      return new Promise(resolve => {
        resolve(email === 'peter@parker.com');
      });
    });

    return lambdaTester(deleteCustomer)
      .event({pathParameters: {email: 'peter@parker.com'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(200);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
          message: `Customer 'peter@parker.com' disabled`,
        });
      });
  });

  it('error', () => {
    jest.spyOn(CustomerService.prototype, 'disableCustomer').mockImplementation((_email: string): Promise<boolean> => {
      throw CustomerServiceMock.disableCustomerError;
    });

    return lambdaTester(deleteCustomer)
      .event({pathParameters: {email: 'peter@parker.com'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(500);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Error disabling customer.`});
      });
  });
});
