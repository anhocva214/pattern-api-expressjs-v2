import { Router } from "express";
import UserController from "@controllers/user.controller";
import UsersValidator from "@validators/users.validator";
import middleware from "@middleware/jwt.middleware";
import rateLimit from "express-rate-limit";
import BaseRouter from "../base.route";
import { formValidate } from "@validators/index";
import otpMiddleware from "@middleware/otp.middleware";

const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 2 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default class UsersRouter extends BaseRouter {
  private controller: UserController;
  private validator: UsersValidator;

  constructor(router: Router) {
    super({ pathBase: "/users", router });
    this.controller = new UserController();
    this.validator = new UsersValidator();
  }

  instance() {
    this.router.post(
      this.path("/create-admin"),
      formValidate(this.validator.createAdmin()),
      this.controller.createUserAdmin.bind(this.controller)
    );
    this.router.put(
      this.path("/update-admin/password"),
      formValidate(this.validator.updatePasswordAdmin()),
      this.controller.updatePasswordUserAdmin.bind(this.controller)
    );

    this.router.put(
      this.path("/"),
      formValidate(this.validator.update()),
      this.controller.update.bind(this.controller)
    );
    this.router.post(
      this.path("/:userId/lock"),
      this.controller.lock.bind(this.controller)
    );
    this.router.post(
      this.path("/:userId/unlock"),
      this.controller.unlock.bind(this.controller)
    );
    this.router.get(
      this.path("/"),
      this.controller.getAll.bind(this.controller)
    );
    this.router.get(
      this.path("/me"),
      this.controller.myInfo.bind(this.controller)
    );
    this.router.get(
      this.path("/:userId"),
      this.controller.get.bind(this.controller)
    );
    this.router.post(
      this.path("/reset-password"),
      formValidate(this.validator.requestResetPassword()),
      this.controller.requestResetPassword.bind(this.controller)
    );
    this.router.put(
      this.path("/reset-password"),
      formValidate(this.validator.resetPassword()),
      this.controller.resetPassword.bind(this.controller)
    );
  }
}
