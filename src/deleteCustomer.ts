import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {StatusCode} from './utils/messages';

import DynamoDBClient from './services/dynamodb';
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

  await DynamoDBClient.delete(deleteParams);

  const bodyResult = {
    message: `Customer '${customerEmail}' deleted`,
  };

  return {
    statusCode: StatusCode.OK,
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(bodyResult),
  };
};
