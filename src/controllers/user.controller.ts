import StatusCodes from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { User, UserModel } from "@models/user.model";
import { Token, TokenModel } from "@models/token.model";
import bcrypt from "bcrypt";
import JwtService from "@services/jwt.service";
import moment from "moment";
import MailService from "@services/mail.service";
import otpGenerator from "otp-generator";
import _ from "lodash";
import slugify from "@helpers/function.helper";
import { FileUpload } from "@models/upload.model";
import UserService from "@services/app/user.service";
import { Hits } from "meilisearch";
import { FilterQuery } from "mongoose";

export default class UserController {
  private jwtService: JwtService;
  private mailService: MailService;
  private userService: UserService;

  constructor() {
    this.jwtService = new JwtService();
    this.mailService = new MailService();
    this.userService = new UserService();
  }

  private generateOTPCode() {
    return otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
  }

  async createUserAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      let user = new User(req.body);
      user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
      user.preCreate();
      await UserModel.create(user);
      res.json({});
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

  // get all users
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page?.toString() || "1");
    const limit = parseInt(req.query.limit?.toString() || "10");
    let search = req.query.search?.toString() || "";
    let role = req.query.role?.toString() || "user";
    let locked = req.query.locked?.toString() == "true";

    let data = await this.userService.getList({
      page,
      limit,
      role,
      locked,
      search,
    });

    return res.json(data);
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      // let userId = req.params.userId;
      // let user = (
      //   await UserModel.findById(userId).select("-password")
      // )?.toObject();
      // let sub = (await SubscriptionModel.findOne({ user: userId }))?.toObject();
      // return res.json({
      //   user,
      //   subscription: sub,
      // });
    } catch (err) {
      next(err);
    }
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

  async asyncSearch(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.asyncSearch();
      return res.json({});
    } catch (err) {
      next(err);
    }
  }

  async requestDating(req: Request, res: Response, next: NextFunction) {
    try {
      let user = new User(req.user);
      let parentId = req.params.parentId?.toString() || "";

      await this.userService.requestDating(user, parentId);

      return res.json({});
    } catch (err) {
      next(err);
    }
  }

  async approveDating(req: Request, res: Response, next: NextFunction) {
    try {
      let user = new User(req.user);
      let coupleId = req.params.coupleId?.toString() || "";

      await this.userService.approveDating(user, coupleId);

      return res.json({});
    } catch (err) {
      next(err);
    }
  }

  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try{
      let data = await this.userService.getMyNotifications(req.user.id)
      return res.json(data);
    }
    catch (err) {
      next(err);
    }
  }
}
