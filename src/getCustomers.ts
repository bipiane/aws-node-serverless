'use strict'
import AWS from 'aws-sdk';
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

module.exports.getCustomers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.info('getCustomers: ', event);
    const scanParams = {
        TableName: process.env.DYNAMODB_CUSTOMER_TABLE
    }

    const dynamodb = new AWS.DynamoDB.DocumentClient()
    const result = await dynamodb.scan(scanParams).promise()

    const bodyResult = {
        total: result.Count,
        items: result.Items.map(customer => {
            return {
                name: customer.primary_key,
                email: customer.email
            }
        })
    }

    return {
        statusCode: 200,
        body: JSON.stringify(bodyResult)
    }
}