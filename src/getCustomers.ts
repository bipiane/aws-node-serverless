import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {StatusCode} from './utils/messages';

const dynamodb = DynamoDBDocument.from(new DynamoDB());
/**
 * Gets all customers
 * @param event
 */
module.exports.getCustomers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.info('getCustomers: ', event);
  const scanParams = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
  };

  const result = await dynamodb.scan(scanParams);

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
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(bodyResult),
  };
};
