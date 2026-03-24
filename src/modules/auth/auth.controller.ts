import { AuthService } from "./auth.service";
import { SignInBody, SignUpBody } from "./auth.model";

export abstract class AuthController {
  static signIn(body: SignInBody) {
    return AuthService.signIn(body);
  }

  static signUp(body: SignUpBody) {
    return AuthService.signUp(body);
  }
}
