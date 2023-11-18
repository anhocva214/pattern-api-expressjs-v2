import {Router } from "express";
import BaseRouter from "../base.route";
import AuthController from "@controllers/auth.controller";
import { formValidate } from "@validators/index";
import AuthValidator from "@validators/auth.validator";
import middleware from "@middleware/jwt.middleware";
import otpMiddleware from "@middleware/otp.middleware";

export default class AuthRouter extends BaseRouter {
  private controller: AuthController;
  private validator: AuthValidator;

  constructor(router: Router) {
    super({ pathBase: "/auth", router });
    this.controller = new AuthController();
    this.validator = new AuthValidator();
  }

  instance() {
    this.router.post(
      this.path("/login"),
      formValidate(this.validator.login()),
      this.controller.login.bind(this.controller)
    );
    this.router.post(
      this.path("/register"),
      otpMiddleware("register"),
      formValidate(this.validator.register()),
      this.controller.register.bind(this.controller)
    );
    this.router.get(
      this.path("/logout"),
      this.controller.logout.bind(this.controller)
    );
    this.router.get(
      this.path("/captcha"),
      this.controller.getCaptcha.bind(this.controller)
    );
    this.router.post(
      this.path("/captcha"),
      this.controller.verifyCaptcha.bind(this.controller)
    );
    this.router.post(
      this.path("/otp/send"),
      formValidate(this.validator.sendOTP()),
      this.controller.sendOTP.bind(this.controller)
    );
    this.router.post(
      this.path("/otp/verify"),
      formValidate(this.validator.verifyOTP()),
      this.controller.verifyOTP.bind(this.controller)
    );
  }
}
