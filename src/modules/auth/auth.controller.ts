import { AuthService } from "./auth.service";
import { LoginBody } from "./auth.type";

export abstract class AuthController {
  static doStuff(body: LoginBody) {
    return AuthService.doStuff(body);
  }
}
