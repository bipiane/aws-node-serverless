import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {PutCommandInput} from '@aws-sdk/lib-dynamodb/dist-types/commands/PutCommand';
import {Customer} from './model/Customer';
import {StatusCode} from './utils/messages';

const dynamoDb = DynamoDBDocument.from(new DynamoDB());
/**
 * Creates a new customer.
 * Usage: curl -X POST -d '{"name":"Peter Parker","email":"peter@parker.com"}' --url http://localhost:3000/api/v1/customers
 * @param event
 */
module.exports.createCustomer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.info('createCustomer: ', event);
  const body: Customer = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body);
  const putParams: PutCommandInput = {
    TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
    Item: {
      primary_key: body.email?.toLowerCase(),
      name: body.name,
    },
  };
  await dynamoDb.put(putParams);

  const bodyResult = {
    message: 'Customer created',
  };

  return {
    statusCode: StatusCode.CREATED,
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(bodyResult),
  };
};
