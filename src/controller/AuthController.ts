import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';
import {AdminCreateUserCommandInput} from '@aws-sdk/client-cognito-identity-provider/dist-types/commands/AdminCreateUserCommand';
import {AdminInitiateAuthCommandInput} from '@aws-sdk/client-cognito-identity-provider/dist-types/commands/AdminInitiateAuthCommand';
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
      const {user_pool_id} = process.env;
      const params: AdminCreateUserCommandInput = {
        UserPoolId: user_pool_id,
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
        const paramsForSetPass = {
          Password: password,
          UserPoolId: user_pool_id,
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
      const {user_pool_id, client_id} = process.env;
      const params: AdminInitiateAuthCommandInput = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        UserPoolId: user_pool_id,
        ClientId: client_id,
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
