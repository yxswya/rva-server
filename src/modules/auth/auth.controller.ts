import { AuthService } from "./auth.service";
import {
  SignInBody,
  SignUpBody,
  SignInResponse,
  SignUpResponse,
} from "./auth.model";

export abstract class AuthController {
  static async signIn(body: SignInBody): Promise<SignInResponse> {
    const data = await AuthService.signIn(body);
    return {
      success: !!data,
      data,
      errorCode: 500,
      errorMessage: data ? "" : "账号或密码错误",
    };
  }

  static async signUp(body: SignUpBody): Promise<SignUpResponse> {
    const data = await AuthService.signUp(body);
    return {
      success: !!data,
      data,
      errorCode: 500,
      errorMessage: data ? "" : "账号或邮箱已被使用",
    };
  }
}
