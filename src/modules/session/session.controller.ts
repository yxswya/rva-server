import { SessionService } from "./session.service";
import { SignInBody } from "./session.model";

export abstract class SessionController {
  static signIn(body: SignInBody) {
    return SessionService.signIn(body);
  }
}
