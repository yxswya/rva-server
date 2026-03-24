import { AuthService } from "./auth.service";
import { SignInBody } from "./auth.model";

export abstract class AuthController {
  static signIn(body: SignInBody) {
    return AuthService.signIn(body);
  }
}
