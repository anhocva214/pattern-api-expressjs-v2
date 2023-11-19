import { ENV } from "@helpers/env.helper";
import { User, UserListGenders, UserModel } from "@models/user.model";
import { check, validationResult } from "express-validator";
import { MESSAGE_TYPE } from "./i18n/type";
import { RoleModel } from "@models/role.model";

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

  updatePasswordSuperAdmin() {
    return [
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
          if (!existingUser) {
            throw new Error(MESSAGE_TYPE.not_exist);
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

  create() {
    return [
      check("fullname").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("phoneNumber")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .custom(async (input: string, { req }) => {
          let role = req.body.role;
          const existing = await UserModel.exists({
            phoneNumber: input,
            role,
          });
          if (existing) {
            throw new Error(MESSAGE_TYPE.exists);
          }
        }),
      check("gender")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isIn(UserListGenders)
        .withMessage(MESSAGE_TYPE.invalid),
      check("birthday").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("email")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isEmail()
        .withMessage(MESSAGE_TYPE.invalid)
        .trim()
        .normalizeEmail()
        .custom(async (input: string, { req }) => {
          let role = req.body.role;
          const existingUser = await UserModel.exists({
            email: input,
            role,
          });
          if (existingUser) {
            throw new Error(MESSAGE_TYPE.exists);
          }
        }),
      ,
      check("password").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("role")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .custom(async (input: string, { req }) => {
          const existing = await RoleModel.exists({ value: input });
          if (!existing) {
            throw new Error(MESSAGE_TYPE.not_exist);
          }
        }),
    ];
  }

  update() {
    return [
      check("fullname").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("gender")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .isIn(UserListGenders)
        .withMessage(MESSAGE_TYPE.invalid),
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
