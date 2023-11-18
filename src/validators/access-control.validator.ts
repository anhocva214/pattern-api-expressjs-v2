import { check, validationResult } from "express-validator";
import { MESSAGE_TYPE } from "./i18n/type";
import { isArrayOfString } from "@helpers/access-control.helper";

export default class AccessControlValidator {
  constructor() {}

  createRole() {
    return [
      check("value").not().isEmpty().withMessage(MESSAGE_TYPE.required),
      check("permissions").custom(isArrayOfString),
    ];
  }
}
