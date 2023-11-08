'use strict';
import AWS from 'aws-sdk';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {Customer} from './model/Customer';
import {StatusCode} from './utils/messages';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
/**
 * Creates a new customer.
 * Usage: curl -X POST -d '{"name":"Peter Parker","email":"peter@parker.com"}' --url http://localhost:3000/api/v1/customers
 * @param event
 */
module.exports.createCustomer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.info('createCustomer: ', event);
  const body: Customer = JSON.parse(Buffer.from(event.body, 'base64').toString());
  const putParams: DocumentClient.PutItemInput = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: body.email?.toLowerCase(),
      name: body.name,
    },
  };
  const createdCustomer = await dynamoDb.put(putParams).promise();

  const bodyResult = {
    message: 'Customer created',
    data: createdCustomer.$response.data,
  };

  return {
    statusCode: StatusCode.CREATED,
    body: JSON.stringify(bodyResult),
  };
};
