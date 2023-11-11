import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {PutCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand';
import {CustomerDB, CustomerDTO} from './model/Customer';
import {ResponseData, StatusCode} from './utils/messages';

import DynamoDBClient from './services/dynamodb';

/**
 * Creates a new customer.
 * Usage: curl -X POST -d '{"name":"Peter Parker","email":"peter@parker.com"}' --url http://localhost:3000/api/v1/customers
 * @param event
 */
module.exports.createCustomer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body: CustomerDTO = JSON.parse(
    event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body,
  );

  if (!body?.email || !body?.name) {
    return new ResponseData({error: 'Email and name are required.'}, StatusCode.CONFLICT);
  }
  body.email = body?.email?.toLowerCase();

  const existCustomer = await DynamoDBClient.get({
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      email: body.email,
    },
    ProjectionExpression: 'enabled',
  });

  if (existCustomer.Item && existCustomer.Item.enabled) {
    return new ResponseData({error: `Customer '${body.email}' already created.`}, StatusCode.CONFLICT);
  }

  const newCustomer: CustomerDB = {
    email: body.email,
    name: body.name,
    enabled: true,
  };

  const putParams: PutCommandInput = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: newCustomer,
  };
  await DynamoDBClient.put(putParams);

  const bodyResult = {
    message: `Customer '${body.email}' created.`,
  };

  return new ResponseData(bodyResult);
};
