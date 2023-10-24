'use strict'
const AWS = require('aws-sdk')

module.exports.getCustomers = async (event) => {
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