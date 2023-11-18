import { ENV } from "@helpers/env.helper";
import { User, UserModel } from "@models/user.model";
import { check, validationResult } from "express-validator";
import { MESSAGE_TYPE } from "./i18n/type";

export default class UsersValidator {
  constructor() {}

  createSuperAdmin() {
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
            role: "super_admin",
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
    ];
  }

  updatePasswordAdmin() {
    return [
      check("password").not().isEmpty().withMessage(MESSAGE_TYPE.required),
    ];
  }

  update() {
    return [
      check("fullname").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("gender").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("birthday").not().isEmpty().withMessage(MESSAGE_TYPE.required),
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
