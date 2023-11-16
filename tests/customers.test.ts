import {APIGatewayProxyResult} from 'aws-lambda';
import lambdaTester from 'lambda-tester';
import {CustomerDB, CustomerListDB} from '../src/model/Customer';
import {CustomerService} from '../src/services/CustomerService';
import {createCustomer, deleteCustomer, getAllCustomers, getCustomer} from '../src/handler';
import CustomerServiceMock from './CustomerService.mock';

jest.mock('../src/services/CustomerService');

describe('create [POST]', () => {
  it('success', () => {
    jest
      .spyOn(CustomerService.prototype, 'existsCustomer')
      .mockImplementation((_search: {username: string; email: string}): Promise<boolean> => {
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
    jest
      .spyOn(CustomerService.prototype, 'existsCustomer')
      .mockImplementation((search: {username: string; email: string}): Promise<boolean> => {
        return new Promise(resolve => {
          // it isn't a new customer
          resolve(search.username === 'tonystark');
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
        expect(body).toStrictEqual({error: "Customer 'tonystark <tony@stark.com>' already created."});
      });
  });

  it('error: email and name are required', () => {
    jest
      .spyOn(CustomerService.prototype, 'existsCustomer')
      .mockImplementation((_search: {username: string; email: string}): Promise<boolean> => {
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
      .mockImplementation((_search: {username: string; email: string}): Promise<boolean> => {
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

describe('show [GET]', () => {
  it('success', () => {
    jest.spyOn(CustomerService.prototype, 'findCustomer').mockImplementation((uuid: string): Promise<CustomerDB> => {
      return new Promise(resolve => {
        if (uuid === 'dnJb8Km2La6z') {
          resolve(CustomerServiceMock.findCustomer);
        } else {
          resolve(null);
        }
      });
    });

    return lambdaTester(getCustomer)
      .event({pathParameters: {uuid: 'dnJb8Km2La6z'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(200);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
          uuid: 'dnJb8Km2La6z',
          name: 'Peter Parker',
          username: 'peterparker',
          email: 'peter@parker.com',
          enabled: true,
        });
      });
  });

  it('error', () => {
    jest.spyOn(CustomerService.prototype, 'findCustomer').mockImplementation((_uuid: string): Promise<CustomerDB> => {
      throw CustomerServiceMock.findCustomerError;
    });

    return lambdaTester(getCustomer)
      .event({pathParameters: {uuid: 'dnJb8Km2La6z'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(500);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Error querying a customer.`});
      });
  });

  it('error: customer not found', () => {
    jest.spyOn(CustomerService.prototype, 'findCustomer').mockImplementation((_uuid: string): Promise<CustomerDB> => {
      return new Promise(resolve => {
        resolve(null);
      });
    });

    return lambdaTester(getCustomer)
      .event({pathParameters: {uuid: 'dnJb8Km2La6z'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(404);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Customer with uuid 'dnJb8Km2La6z' not found.`});
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
            uuid: '73WakrfVbNJ',
            username: 'peterparker',
            email: 'peter@parker.com',
            enabled: true,
            name: 'Peter Parker',
          },
          {
            uuid: 'mhQtEeDv',
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

  it('Throw test exception', () => {
    return lambdaTester(getAllCustomers)
      .event({queryStringParameters: {alert_status: 'alarm'}})
      .expectError((err: any) => {
        expect(err.message).toStrictEqual(`Error test lambada!`);
      });
  });
});

describe('delete [DELETE]', () => {
  it('success', () => {
    jest.spyOn(CustomerService.prototype, 'disableCustomer').mockImplementation((uuid: string): Promise<boolean> => {
      return new Promise(resolve => {
        resolve(uuid === 'j9zjZwxNPw');
      });
    });

    return lambdaTester(deleteCustomer)
      .event({pathParameters: {uuid: 'j9zjZwxNPw'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(200);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({
          message: `Customer 'j9zjZwxNPw' disabled`,
        });
      });
  });

  it('error', () => {
    jest.spyOn(CustomerService.prototype, 'disableCustomer').mockImplementation((_uuid: string): Promise<boolean> => {
      throw CustomerServiceMock.disableCustomerError;
    });

    return lambdaTester(deleteCustomer)
      .event({pathParameters: {uuid: 'asdJ3b1Nm'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(500);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: `Error disabling customer.`});
      });
  });

  it('error: customer not found', () => {
    jest.spyOn(CustomerService.prototype, 'disableCustomer').mockImplementation((_uuid: string): Promise<boolean> => {
      return new Promise(resolve => {
        // ConditionalCheckFailedException: customer not found
        resolve(false);
      });
    });

    return lambdaTester(deleteCustomer)
      .event({pathParameters: {uuid: 'as0J3b1NmaXs'}})
      .expectResult((result: APIGatewayProxyResult) => {
        expect(result.statusCode).toStrictEqual(404);
        const body = JSON.parse(result.body);
        expect(body).toStrictEqual({error: "Customer with uuid 'as0J3b1NmaXs' not found."});
      });
  });
});
