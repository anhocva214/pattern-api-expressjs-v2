import { UploadController } from "@controllers/upload.controller";
import { Router } from "express";
import BaseRouter from "../base.route";
import middleware from "@middleware/jwt.middleware";
import AccessControlController from "@controllers/access-control.controller";
import { formValidate } from "@validators/index";
import AccessControlValidator from "@validators/access-control.validator";

export default class AccessControlRouter extends BaseRouter {
  private controller: AccessControlController = new AccessControlController();
  private validator: AccessControlValidator = new AccessControlValidator();

  constructor(router: Router) {
    super({ pathBase: "/access-control", router });
  }

  instance() {
    this.router.get(
      this.path("/permissions"),
      this.controller.getAllPermissions.bind(this.controller)
    );
    this.router.post(
      this.path("/role"),
      middleware("role.create"),
      formValidate(this.validator.createRole()),
      this.controller.createRole.bind(this.controller)
    );
    this.router.get(
      this.path("/role"),
      middleware("role.get_list"),
      this.controller.listRoles.bind(this.controller)
    );
  }
}
