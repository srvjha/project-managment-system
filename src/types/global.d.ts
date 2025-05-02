import { UserInterface } from "../models/user.models";

declare global {
  namespace Express {
    interface Request {
      user: UserInterface;
    }
  }
}
