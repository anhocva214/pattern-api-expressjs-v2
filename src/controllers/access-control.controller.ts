import AccessControlService from "@services/app/access-control.service";
import { NextFunction, Request, Response } from "express";

export default class AccessControlController {
  private accessControlService: AccessControlService =
    new AccessControlService();

  constructor() {}

  getAllPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      let permissions = this.accessControlService.getAllPermissions();
      return res.json(permissions);
    } catch (err) {
      next(err);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      let { value, permissions } = req.body;
      let data = await this.accessControlService.createRole({
        value,
        permissions,
        editable: true,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async listRoles(req: Request, res: Response, next: NextFunction) {
    try {
      let data = await this.accessControlService.listRoles();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      let { value, permissions } = req.body;

      let data = await this.accessControlService.updateRole({
        value,
        permissions,
        editable: true,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
}
