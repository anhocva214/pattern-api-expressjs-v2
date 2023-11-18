import StatusCodes from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { User, UserModel } from "@models/user.model";
import { TokenModel } from "@models/token.model";
import bcrypt from "bcrypt";
import JwtService from "@services/jwt.service";
import moment from "moment";
import MailService from "@services/mail.service";
import _ from "lodash";
import { FileUpload } from "@models/upload.model";
import UserService from "@services/app/user.service";
export default class UserController {
  private jwtService: JwtService;
  private mailService: MailService;
  private userService: UserService;

  constructor() {
    this.jwtService = new JwtService();
    this.mailService = new MailService();
    this.userService = new UserService();
  }

  async createSuperAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      let {fullname, email, password, keyCreate} = req.body;
      let data = await this.userService.createSuperAdmin({fullname, email,password, keyCreate})
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async updatePasswordUserAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let user = new User(req.user);
      let { password } = req.body;
      user.password = await bcrypt.hash(password, await bcrypt.genSalt());
      await UserModel.updateOne(
        { _id: user.id },
        {
          password: user.password,
          updatedAt: new Date(),
        }
      );
      res.json({});
    } catch (err) {
      next(err);
    }
  }

  // update info
  async update(req: Request, res: Response) {
    let user = new User(req.user);
    let avatarFile = new FileUpload(req.file as any);
    let { fullname, birthday, gender } = req.body;

    let data = await this.userService.update(user.id || "", {
      avatarFile,
      fullname,
      birthday,
      gender,
    });

    return res.json(data);
  }

  // lock
  async lock(req: Request, res: Response) {
    let { userId } = req.params;
    await UserModel.updateOne(
      { _id: userId },
      { locked: true, updatedAt: new Date() }
    );
    return res.json({});
  }

  async unlock(req: Request, res: Response) {
    let { userId } = req.params;
    await UserModel.updateOne(
      { _id: userId },
      { locked: false, updatedAt: new Date() }
    );
    return res.json({});
  }

  // get my info
  async myInfo(req: Request, res: Response) {
    let data = await this.userService.getMyInfo(new User(req.user))
    return res.json(data)
  }

  async requestResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      let { email } = req.body;
      let user = (await UserModel.findOne({ email, role: "user" }))?.toObject();

      if (!user) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "Người dùng không tồn tại" });
      }

      let token = this.jwtService.verifyOTP(user?.id || "");
      let nowDate = new Date();
      await TokenModel.create({
        payload: token,
        expiredAt: moment(nowDate).add(15, "minutes").toDate(),
        createdAt: nowDate,
        updatedAt: nowDate,
        type: "reset_password_token",
      });
      await this.mailService.sendLinkResetPassword({
        token,
        to: user?.email || "",
        user,
      });

      return res.json({});
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      let { newPassword, token } = req.body;
      let tokenData = await TokenModel.findOne({
        payload: token,
        type: "reset_password_token",
      });
      if (!tokenData) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "Token không tồn tại" });
      }
      let { id: userId } = this.jwtService.verifyAccessToken(token);

      await UserModel.updateOne(
        { _id: userId },
        {
          password: await bcrypt.hash(newPassword, await bcrypt.genSalt()),
          updatedAt: new Date(),
        }
      );

      await TokenModel.deleteOne({
        payload: token,
        type: "reset_password_token",
      });

      return res.json({});
    } catch (err) {
      next(err);
    }
  }
}
