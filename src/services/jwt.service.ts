import { ENV } from "@helpers/env.helper";
import { User } from "@models/user.model";
import jwt, { JwtPayload } from "jsonwebtoken";

export default class JwtService {
  private secret: string;

  constructor() {
    this.secret = ENV.JWT_SIGNING_KEY || "";
  }

  login(user: User, expiresIn: number) {
    return jwt.sign(
      {
        data: {
          id: user.id,
          timestamp: new Date().getTime(),
        },
      },
      this.secret,
      { expiresIn }
    );
  }

  verifyAccessToken(token: string): {
    id: string;
    timestamp: number;
  } {
    let payload = jwt.verify(token, this.secret) as JwtPayload;
    return payload.data;
  }

  verifyOTP(userId: string) {
    return jwt.sign(
      {
        data: {
          id: userId,
          timestamp: new Date().getTime(),
        },
      },
      this.secret,
      { expiresIn: 15 * 60 }
    );
  }

}
