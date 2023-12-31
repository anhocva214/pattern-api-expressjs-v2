import { AppError } from "@models/error";
import { User, UserModel } from "@models/user.model";
import OtpService from "../otp.service";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { Token, TokenModel } from "@models/token.model";
import JwtService from "../jwt.service";
import moment from "moment";
import slugify, { isEmail } from "@helpers/function.helper";
import UserService from "./user.service";

export default class AuthService {
  private otpService: OtpService;
  private jwtService: JwtService;
  private LOGIN_EXPIRES_IN: number;
  private userService: UserService;

  constructor() {
    this.otpService = new OtpService();
    this.jwtService = new JwtService();
    this.LOGIN_EXPIRES_IN = 60 * 60 * 24 * 30 * 3; // 3 month
    this.userService = new UserService();
  }


  async login(data: { username: string; password: string; role: string }) {
    let user = new User(
      (await UserModel.findOne({
        ...(isEmail(data.username)
          ? { email: data.username }
          : { phoneNumber: data.username }),
        role: data.role,
      })) as any
    );

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError({
        where: "login",
        message: "login_failure",
        statusCode: StatusCodes.UNAUTHORIZED,
        detail: null,
      });
    }

    if (user.locked) {
      throw new AppError({
        where: "login",
        message: "account_locked",
        statusCode: StatusCodes.FORBIDDEN,
        detail: null,
      });
    }

    let token = new Token<string>();
    token.preCreate();
    token.payload = this.jwtService.login(user, this.LOGIN_EXPIRES_IN);
    token.type = "access_token";
    token.expiredAt = moment(token.createdAt)
      .add(this.LOGIN_EXPIRES_IN, "seconds")
      .toDate();

    await TokenModel.create(token);

    return {
      user: { ...user, password: undefined },
      token: {
        accessToken: token.payload,
        expiredAt: token.expiredAt,
      },
    };
  }

  async register(phoneNumber: string, password: string) {
    let user = new User({
      phoneNumber,
      password,
    } as any);
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
    user.role = "user";
    user.balance = 0;
    user.fullnameSlug = slugify(user.fullname);
    user.preCreate();
    let newUser = new User(await UserModel.create(user));
    return { userId: newUser.id };
  }
}
