'use strict';
const AWS = require('aws-sdk');

/**
 * curl -X POST -d '{"name":"Peter Parker","email":"peter@parker.com"}' --url https://yourURL/api/v1/customers
 * @param event
 * @returns {Promise<{statusCode: number}>}
 */
module.exports.createCustomer = async (event) => {
    console.info('createCustomer: ', event);
    const body = JSON.parse(Buffer.from(event.body, 'base64').toString());
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const putParams = {
        TableName: process.env.DYNAMODB_CUSTOMER_TABLE,
        Item: {
            primary_key: body.name,
            email: body.email,
        },
    };
    await dynamoDb.put(putParams).promise();

    return {
        statusCode: 201,
    };
};