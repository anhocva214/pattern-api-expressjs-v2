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
      gender
    });

    return res.json(data)
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
    return res.status(200).send(req.user);
  }

  // get all users
  async getAll(req: Request, res: Response) {
    const page = parseInt(req.query.page?.toString() || "1");
    const limit = parseInt(req.query.limit?.toString() || "10");
    let role = req.query.role?.toString();
    let locked = req.query.locked?.toString() == "true";
    const email = req.query.email?.toString() || "";
    const fullname = req.query.fullname?.toString() || "";

    //  let users = await UserModel.find({})
    //  await Promise.all(users.map(async user => {
    //   await UserModel.updateOne({_id: user._id}, {fullnameSlug: slugify(user.fullname)})
    //  }))

    let data = await UserModel.aggregate([
      {
        $match: {
          $and: [
            fullname
              ? {
                  fullnameSlug: {
                    $regex: `.*${slugify(fullname)}.*`,
                    $options: "i",
                  },
                }
              : {},
            role ? { role } : {},
            locked ? { locked } : {},
            email ? { email } : {},
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: limit * (page - 1),
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          fullname: 1,
          email: 1,
          phoneNumber: 1,
          career: 1,
          balance: 1,
          createdAt: 1,
          updatedAt: 1,
          locked: 1,
          birthday: 1,
          workUnit: 1,
          followAlert: 1,
          purposesUsing: 1,
          service: 1,
        },
      },
    ]);

    let dataTotal = await UserModel.aggregate([
      {
        $match: {
          $and: [
            fullname
              ? {
                  fullnameSlug: {
                    $regex: `.*${slugify(fullname)}.*`,
                    $options: "i",
                  },
                }
              : {},
            role ? { role } : {},
            locked ? { locked } : {},
            email ? { email } : {},
          ],
        },
      },
    ]);

    return res.json({
      data,
      paginate: {
        page,
        limit,
        totalPages: Math.ceil(dataTotal.length / limit),
      },
    });
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
}
