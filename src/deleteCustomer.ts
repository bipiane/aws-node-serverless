import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ResponseData} from './utils/messages';

import DynamoDBClient from './services/dynamodb';
import {UpdateCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/UpdateCommand';

/**
 * Disables a customer by email
 * @param event
 */
module.exports.deleteCustomer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const customerEmail = event.pathParameters.email?.toLowerCase();

  const updateParams: UpdateCommandInput = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Key: {
      email: customerEmail,
    },
    AttributeUpdates: {
      enabled: {
        Value: false,
      },
    },
  };

  await DynamoDBClient.update(updateParams);

  const bodyResult = {
    message: `Customer '${customerEmail}' disabled`,
  };

  return new ResponseData(bodyResult);
};
