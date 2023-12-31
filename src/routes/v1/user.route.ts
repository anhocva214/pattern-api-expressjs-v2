import { Router } from "express";
import UserController from "@controllers/user.controller";
import UsersValidator from "@validators/users.validator";
import middleware from "@middleware/jwt.middleware";
import rateLimit from "express-rate-limit";
import BaseRouter from "../base.route";
import { formValidate } from "@validators/index";
import UploadService from "@services/upload.service";

const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 2 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default class UsersRouter extends BaseRouter {
  private controller: UserController;
  private validator: UsersValidator;
  private uploadService: UploadService

  constructor(router: Router) {
    super({ pathBase: "/users", router });
    this.controller = new UserController();
    this.validator = new UsersValidator();
    this.uploadService = new UploadService();
  }

  instance() {
    this.router.post(
      this.path("/super-admin/create"),
      formValidate(this.validator.createSuperAdmin()),
      this.controller.createSuperAdmin.bind(this.controller)
    );

    this.router.put(
      this.path("/super-admin/password"),
      formValidate(this.validator.updatePasswordSuperAdmin()),
      this.controller.updatePasswordSuperAdmin.bind(this.controller)
    );

    this.router.post(
      this.path("/create"),
      middleware("user.create"),
      formValidate(this.validator.create()),
      this.controller.create.bind(this.controller)
    );

    this.router.put(
      this.path("/:userId/update"),
      middleware("user.update_by_id"),
      formValidate(this.validator.update()),
      this.controller.updateById.bind(this.controller)
    );

    this.router.delete(
      this.path("/:userId/delete"),
      middleware("user.delete_by_id"),
      this.controller.deleteById.bind(this.controller)
    );

    this.router.put(
      this.path("/"),
      middleware("user.update"),
      this.uploadService.instance().single("avatarFile"),
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
      this.path("/me"),
      middleware("user.get_detail"),
      this.controller.myInfo.bind(this.controller)
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
