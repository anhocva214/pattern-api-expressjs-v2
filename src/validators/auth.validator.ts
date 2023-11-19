import { check, validationResult } from "express-validator";
import { MESSAGE_TYPE } from "./i18n/type";
import { LIST_OTP_SERVICES } from "@models/token.model";
import { RoleModel } from "@models/role.model";

export default class AuthValidator {
  constructor() {}

  login() {
    return [
      check("role")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .custom(async (input: string, { req }) => {
          const existing = await RoleModel.exists({value: input});
          if (!existing) {
            throw new Error(MESSAGE_TYPE.not_exist);
          }
        }),
      check("username").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("password").not().isEmpty().withMessage(MESSAGE_TYPE.required),
    ];
  }

  preLogin() {
    return [
      check("phoneNumber")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isNumeric()
        .withMessage(MESSAGE_TYPE.numeric),
    ];
  }

  register() {
    return [
      check("password").not().isEmpty().withMessage(MESSAGE_TYPE.required),
    ];
  }

  sendOTP() {
    return [
      check("to").not().isEmpty().withMessage(MESSAGE_TYPE.required).trim(),
      check("method")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isIn(["email", "sms"])
        .withMessage(MESSAGE_TYPE.invalid),
      check("service")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isIn(LIST_OTP_SERVICES)
        .withMessage(MESSAGE_TYPE.invalid),
    ];
  }

  verifyOTP() {
    return [
      check("otpId").not().isEmpty().withMessage(MESSAGE_TYPE.required).trim(),
      check("otpCode")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .trim(),
      check("service")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isIn(LIST_OTP_SERVICES)
        .withMessage(MESSAGE_TYPE.invalid),
    ];
  }
}
