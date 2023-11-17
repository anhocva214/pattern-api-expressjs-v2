import { NextFunction, Request, Response } from "express";
import {
  ValidationChain,
  matchedData,
  validationResult,
} from "express-validator";
import { IErrorValidator } from "./interface";
import { i18nValidator } from "@config/i18n.config";
import _ from "lodash";

export const formValidate = (
  validations: Array<ValidationChain | undefined>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation?.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      req.body = { ...req.body, ...matchedData(req) };
      return next();
    }

    const formattedErrors: IErrorValidator = {};
    errors.array().map((error) => {
      let message = i18nValidator.message
        .__({ phrase: error.msg, locale: req.lang })
        .replace(
          ":fieldname",
          i18nValidator.fieldname.__({ phrase: "value", locale: req.lang })
        );
      if (formattedErrors[error.param]) {
        formattedErrors[error.param].push(message);
      } else {
        formattedErrors[error.param] = [message];
      }
    });

    res.status(400).json({ errors: formattedErrors });
  };
};
