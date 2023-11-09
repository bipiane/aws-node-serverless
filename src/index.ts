import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {StatusCode} from './utils/messages';

module.exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.info('index: ', event);
  return {
    statusCode: StatusCode.OK,
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(
      {
        message: 'Go Serverless v3.0! Your function executed successfully!',
        input: event,
      },
      null,
      2,
    ),
  };
};
