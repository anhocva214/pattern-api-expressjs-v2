import { ENV } from "@helpers/env.helper";
import { User, UserModel } from "@models/user.model";
import { check, validationResult } from "express-validator";
import { MESSAGE_TYPE } from "./i18n/type";

export default class UsersValidator {
  constructor() {}

  createAdmin() {
    return [
      check("fullname").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("email")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isEmail()
        .withMessage(MESSAGE_TYPE.invalid)
        .trim()
        .normalizeEmail()
        .custom(async (email: string, { req }) => {
          const existingUser = await UserModel.exists({
            email,
            role: req.body.role,
          });
          if (existingUser) {
            throw new Error(MESSAGE_TYPE.exists);
          }
        }),
      ,
      check("password").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("keyCreate")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .custom(async (keyCreate: string) => {
          if (keyCreate !== ENV.KEY_CREATE) {
            throw new Error(MESSAGE_TYPE.invalid);
          }
        }),
      check("role").isIn(["admin", "writer"]).withMessage(MESSAGE_TYPE.invalid),
    ];
  }

  updatePasswordAdmin() {
    return [check("password").not().isEmpty().withMessage(MESSAGE_TYPE.required)];
  }

  update() {
    return [
      check("fullname").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("email")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isEmail()
        .withMessage("is_not_format")
        .trim()
        .normalizeEmail()
        .custom(async (email: string, { req }) => {
          let user = new User(req.user);
          const existingUser = await UserModel.findOne({
            email,
            role: user.role,
          });
          if (existingUser && existingUser?.id != user?.id) {
            throw new Error("is_exists");
          }
        }),
      check("phoneNumber").not().isEmpty().withMessage(MESSAGE_TYPE.required),
    ];
  }

  resetPassword() {
    return [
      check("token").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("newPassword").not().isEmpty().withMessage(MESSAGE_TYPE.required),
    ];
  }

  requestResetPassword() {
    return [
      check("email")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .trim()
        .normalizeEmail(),
    ];
  }
}
