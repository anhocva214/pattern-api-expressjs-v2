import { check, validationResult } from "express-validator";
import { MESSAGE_TYPE } from "./i18n/type";

export default class AuthValidator {
  constructor() {}

  login() {
    return [
      check("role")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isIn(["user", "admin"])
        .withMessage(MESSAGE_TYPE.invalid),
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
      check("to")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .trim(),
      check("method")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isIn(["email", "sms"])
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
    ];
  }
}
