'use strict';
import AWS from 'aws-sdk';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {StatusCode} from './utils/messages';

const dynamodb = new AWS.DynamoDB.DocumentClient();
/**
 * Deletes a customer by email
 * @param event
 */
module.exports.deleteCustomer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.info('deleteCustomer: ', event);
  const customerEmail = event.pathParameters.email?.toLowerCase();

  const deleteParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      primary_key: customerEmail,
    },
  };

  const deletedCustomer = await dynamodb.delete(deleteParams).promise();

  const bodyResult = {
    message: `Customer '${customerEmail}' deleted`,
    data: deletedCustomer.$response.data,
  };

  return {
    statusCode: StatusCode.OK,
    body: JSON.stringify(bodyResult),
  };
};
