import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';
import {AdminCreateUserCommandInput} from '@aws-sdk/client-cognito-identity-provider/dist-types/commands/AdminCreateUserCommand';
import {AdminInitiateAuthCommandInput} from '@aws-sdk/client-cognito-identity-provider/dist-types/commands/AdminInitiateAuthCommand';
import {AdminSetUserPasswordCommandInput} from '@aws-sdk/client-cognito-identity-provider/dist-types/commands/AdminSetUserPasswordCommand';
import {ResponseData, StatusCode} from '../utils/messages';

const cognito = new CognitoIdentityProvider();

export class AuthController {
  /**
   *
   * @param event
   * @param _context
   */
  async signup(event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    try {
      const isValid = this.validateInput(event.body);
      if (!isValid) {
        return new ResponseData({error: `Invalid input`}, StatusCode.BAD_REQUEST);
      }

      const {email, password} = JSON.parse(event.body);
      const {USER_POOL_ID} = process.env;
      const params: AdminCreateUserCommandInput = {
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
        MessageAction: 'SUPPRESS',
      };
      const response = await cognito.adminCreateUser(params);
      if (response.User) {
        const paramsForSetPass: AdminSetUserPasswordCommandInput = {
          Password: password,
          UserPoolId: USER_POOL_ID,
          Username: email,
          Permanent: true,
        };
        await cognito.adminSetUserPassword(paramsForSetPass);
      }
      return new ResponseData({message: 'User registration successful'}, StatusCode.OK);
    } catch (error) {
      const message = error.message ? error.message : 'Internal server error';
      return new ResponseData({error: message}, StatusCode.INTERNAL_ERROR);
    }
  }

  /**
   *
   * @param event
   * @param _context
   */
  async login(event: APIGatewayProxyEvent, _context?: Context): Promise<APIGatewayProxyResult> {
    try {
      const isValid = this.validateInput(event.body);
      if (!isValid) {
        return new ResponseData({error: `Invalid input`}, StatusCode.BAD_REQUEST);
      }

      const {email, password} = JSON.parse(event.body);
      const {USER_POOL_ID, CLIENT_ID} = process.env;
      const params: AdminInitiateAuthCommandInput = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      };
      const response = await cognito.adminInitiateAuth(params);
      return new ResponseData({message: 'Success', token: response.AuthenticationResult.IdToken}, StatusCode.OK);
    } catch (error) {
      const message = error.message ? error.message : 'Internal server error';
      return new ResponseData({error: message}, StatusCode.INTERNAL_ERROR);
    }
  }

  private validateInput = (data: any): boolean => {
    const body = JSON.parse(data);
    const {email, password} = body;
    return !(!email || !password || password.length < 6);
  };
}
