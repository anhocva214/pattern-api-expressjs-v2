import { TAcPermission, TAcResource } from "@models/interface";
import { TUserPermission } from "@models/role.model";
import { TokenModel } from "@models/token.model";
import { UserModel } from "@models/user.model";
import AccessControlService from "@services/access-control.service";
import JwtService from "@services/jwt.service";
import logger from "@services/logger.service";
import { NextFunction, Request, Response } from "express";

const jwtService = new JwtService();
const accessControlService = new AccessControlService();

export default function middleware(permission?: TUserPermission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let authorization: string = req.headers.authorization as string;
    let accessToken = authorization?.split(" ")?.[1]?.trim();
    let socialite = req.headers["socialite"];
    let filterQueryUser: { [k: string]: string } = {};

    if (req.ignoreVerify) {
      return next();
    }

    try {
      let { id } = jwtService.verifyAccessToken(accessToken);
      filterQueryUser._id = id;

      let user = (
        await UserModel.findOne(filterQueryUser).select("-password")
      )?.toObject();

      if (req.ignoreVerifyFail) {
        req.user = user;
        return next();
      }

      let isExistToken = await TokenModel.exists({
        payload: accessToken,
        type: "access_token",
      });

      if (!isExistToken)
        return res.status(401).send({ message: "Người dùng đã đăng xuất" });

      if (!user) {
        return res.status(401).send({ message: "Người dùng đã bị xoá" });
      } else if (!!user?.locked) {
        return res.status(403).send({ message: "Tài khoản đã bị khoá" });
      }

      if (!!permission && !accessControlService.can(user.role, permission)) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền" });
      }

      req.user = user;
      req.token = accessToken;

      next();
    } catch (err: any) {
      if (req.ignoreVerifyFail) {
        next();
      } else {
        logger.error(err);
        if (err.message == "jwt expired") {
          await TokenModel.deleteOne({
            payload: accessToken,
            type: "access_token",
          });
          return res
            .status(419)
            .send({ message: "Người dùng đã hết hạn đăng nhập" });
        } else if (err.message == "jwt must be provided") {
          return res.status(422).send({ message: "Vui lòng đăng nhập" });
        } else return res.status(401).send({ message: "Vui lòng đăng nhập" });
      }
    }
  };
}
