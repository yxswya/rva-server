import { AuthService } from "./auth.service";
import { SignInBody, SignUpBody } from "./auth.model";
import { SignInResponse } from "./auth.response";

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
}

export abstract class AuthController {
  static async signIn(
    body: SignInBody,
  ): Promise<ServiceResult<SignInResponse>> {
    const data = await AuthService.signIn(body);
    return {
      success: !!data,
      data,
    };
  }

  static async signUp(body: SignUpBody) {
    const data = await AuthService.signUp(body);
    return {
      success: !!data,
      data,
    };
  }
}
