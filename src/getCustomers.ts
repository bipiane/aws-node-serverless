import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ScanCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';
import {StatusCode} from './utils/messages';

import DynamoDBClient from './services/dynamodb';

/**
 * Gets all customers
 * @param event
 */
module.exports.getCustomers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.info('getCustomers: ', event);
  const scanParams: ScanCommandInput = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
  };

  const result = await DynamoDBClient.scan(scanParams);

  const bodyResult = {
    total: result.Count,
    items: result.Items.map(customer => {
      return {
        email: customer.email,
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
