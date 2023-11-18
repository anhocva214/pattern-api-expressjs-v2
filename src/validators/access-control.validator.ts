import { check, validationResult } from "express-validator";
import { MESSAGE_TYPE } from "./i18n/type";
import { isArrayOfString } from "@helpers/access-control.helper";
import Role, { RoleModel } from "@models/role.model";

export default class AccessControlValidator {
  constructor() {}

  createRole() {
    return [
      check("value")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .custom(async (input: string, { req }) => {
          const existing = await RoleModel.exists({
            value: input,
          });
          if (existing) {
            throw new Error(MESSAGE_TYPE.exists);
          }
        }),
      ,
      check("permissions").custom(isArrayOfString),
    ];
  }

  updateRole(){
    return [
      check("value")
        .not()
        .isEmpty()
        .withMessage(MESSAGE_TYPE.required)
        .custom(async (input: string, { req }) => {
          const role = new Role(await RoleModel.findOne({
            value: input,
          }) as any);
          if (!role.id) {
            throw new Error(MESSAGE_TYPE.exists);
          }
        }),
      ,
      check("permissions").custom(isArrayOfString),
    ];
  }
}
