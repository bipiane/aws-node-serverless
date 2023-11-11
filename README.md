# Serverless Framework Node API on AWS
[![lifecycle](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental)

---

### Tools

- TypeScript
- AWS Lambda
- AWS DynamoDB
- Serverless Framework
- Docker for Local DynamoDB
- Code Style with Prettier
- Git Hooks with Husky
- ESLint

### Setup

Set the correct node version for the project according to the `.nvmrc` file 
and install node dependencies:

```bash
nvm use
```

```bash
npm install
```

Make sure you have [Serverless Framework v3](https://www.npmjs.com/package/serverless) installed:
```bash
serverless -v
# Install it if necessary
npm install -g serverless
```

### Local Development
After installation, you can start local Serverless emulation with:

```bash
npm run local
```
DynamoDB will run on Docker and the local API Gateway will be available at [http://localhost:3000]()

### Deployment
The Serverless Framework will compile and package the source code and then use your AWS credentials to create the infrastructure on AWS:

```bash
npm run deploy
# or
serverless deploy
```

After deploying, you should see output similar to:

```bash
Deploying aws-node-serverless to stage dev (sa-east-1)

✔ Service deployed to stack aws-node-serverless-dev (193s)

endpoints:
  GET - https://xxxxxxxxx.execute-api.sa-east-1.amazonaws.com/
  POST - https://xxxxxxxxx.execute-api.sa-east-1.amazonaws.com/api/v1/customers
  GET - https://xxxxxxxxx.execute-api.sa-east-1.amazonaws.com/api/v1/customers
  DELETE - https://xxxxxxxxx.execute-api.sa-east-1.amazonaws.com/api/v1/customers/{email}
functions:
  api: aws-node-serverless-dev-api (16 MB)
  createCustomer: aws-node-serverless-dev-createCustomer (16 MB)
  getCustomers: aws-node-serverless-dev-getCustomers (16 MB)
  deleteCustomer: aws-node-serverless-dev-deleteCustomer (16 MB)
```
Serverless Framework uses AWS Cloud Formation under the hood to create the serverless infrastructure,
you can view [Cloud Formation Stacks](https://sa-east-1.console.aws.amazon.com/cloudformation/home) from your AWS account.

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxxxx.execute-api.sa-east-1.amazonaws.com/api/v1/customers
```

Which should result in response similar to the following:

```json
{
  "total": 0,
  "items": []
}
```

**Api Doc** 

[aws-node-serverless.postman_collection.json](apiDoc%2Faws-node-serverless.postman_collection.json)

### Destroy Deployment
With Serverless Framework you can not only quickly create infrastructure on AWS, but you can also delete all created resources if you decide to save costs in the cloud:
```bash
npm run destroy
# or
serverless remove
```
After removing the infrastructure, you should see output similar to:

```bash
> aws-node-serverless@1.0.0 destroy
> serverless remove

Removing aws-node-serverless from stage dev (sa-east-1)

✔ Service aws-node-serverless has been successfully removed (36s)
```