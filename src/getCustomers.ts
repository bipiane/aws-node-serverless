import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ScanCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand';
import {ResponseData} from './utils/messages';

import DynamoDBClient from './services/dynamodb';
import {CustomerDB} from './model/Customer';

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
    items: result.Items.map((customer: CustomerDB): CustomerDB => {
      return {
        email: customer.email,
        name: customer.name,
        enabled: customer.enabled || false,
      };
    }),
  };

  return new ResponseData(bodyResult);
};
