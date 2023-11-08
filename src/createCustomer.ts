'use strict';
import AWS from 'aws-sdk';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {Customer} from "./model/Customer";

/**
 * curl -X POST -d '{"name":"Peter Parker","email":"peter@parker.com"}' --url http://localhost:3000/api/v1/customers
 * @param event
 * @returns {Promise<{statusCode: number}>}
 */
module.exports.createCustomer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.info('createCustomer: ', event);
    const body: Customer = JSON.parse(Buffer.from(event.body, 'base64').toString());
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const putParams = {
        TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
        Item: {
            primary_key: body.name,
            email: body.email,
        },
    };
    await dynamoDb.put(putParams).promise();

    const bodyResult = {
        message: 'Customer created'
    }

    return {
        statusCode: 201,
        body: JSON.stringify(bodyResult)
    };
};