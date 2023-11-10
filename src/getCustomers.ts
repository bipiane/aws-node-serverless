import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ScanCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';
import {ResponseData} from './utils/messages';

import DynamoDBClient from './services/dynamodb';

/**
 * Gets all customers
 * @param _event
 */
module.exports.getCustomers = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

  return new ResponseData(bodyResult);
};
