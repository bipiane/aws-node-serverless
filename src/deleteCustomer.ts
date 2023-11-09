import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {StatusCode} from './utils/messages';

const dynamodb = DynamoDBDocument.from(new DynamoDB());
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

  await dynamodb.delete(deleteParams);

  const bodyResult = {
    message: `Customer '${customerEmail}' deleted`,
  };

  return {
    statusCode: StatusCode.OK,
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(bodyResult),
  };
};
