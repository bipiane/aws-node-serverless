import {APIGatewayProxyResult} from 'aws-lambda';

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_ERROR = 500,
}

export class ResponseData implements APIGatewayProxyResult {
  statusCode: number;
  body: string;
  headers: {[p: string]: boolean | number | string} | undefined;

  constructor(bodyResult: object, statusCode = StatusCode.OK) {
    this.statusCode = statusCode;
    this.headers = {'content-type': 'application/json'};
    this.body = JSON.stringify(bodyResult);
  }
}
