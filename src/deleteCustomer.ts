import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {DeleteCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/DeleteCommand';
import {ResponseData} from './utils/messages';

import DynamoDBClient from './services/dynamodb';
/**
 * Deletes a customer by email
 * @param event
 */
module.exports.deleteCustomer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const customerEmail = event.pathParameters.email?.toLowerCase();

  const deleteParams: DeleteCommandInput = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      email: customerEmail,
    },
  };

  await DynamoDBClient.delete(deleteParams);

  const bodyResult = {
    message: `Customer '${customerEmail}' deleted`,
  };

  return new ResponseData(bodyResult);
};
