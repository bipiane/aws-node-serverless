'use strict';
import AWS from 'aws-sdk';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {StatusCode} from './utils/messages';

const dynamodb = new AWS.DynamoDB.DocumentClient();
/**
 * Gets all customers
 * @param event
 */
module.exports.getCustomers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.info('getCustomers: ', event);
  const scanParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
  };

  const result = await dynamodb.scan(scanParams).promise();

  const bodyResult = {
    total: result.Count,
    items: result.Items.map(customer => {
      return {
        email: customer.primary_key,
        name: customer.name,
      };
    }),
  };

  return {
    statusCode: StatusCode.OK,
    body: JSON.stringify(bodyResult),
  };
};
