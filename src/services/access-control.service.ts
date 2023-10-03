import {
  ALL_PERMISSIONS,
  ME_PERMISSIONS,
} from "@helpers/access-control.helper";
import { AppError } from "@models/error";
import Role, { RoleModel, TUserPermission } from "@models/role.model";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import logger from "./logger.service";

export default class AccessControlService {
  allPermissions = ALL_PERMISSIONS;
  mePermissions = ME_PERMISSIONS;

  constructor() {}

  async init() {
    if (!(await this.existRole("super_admin"))) {
      await this.createRole("super_admin", this.allPermissions);
      logger.info("Create role super_admin successfully");
    }

    if (!(await this.existRole("user"))) {
      await this.createRole("user", [...this.mePermissions]);
      logger.info("Create role user successfully");
    }
  }

  checkInvalidPermissions(permissions: TUserPermission[]) {
    let invalidPermissions = _.difference(permissions, this.allPermissions);
    if (invalidPermissions.length > 0) {
      throw new AppError({
        where: "checkInvalidPermissions",
        message: `Invalid permissions: ${invalidPermissions.join(", ")}`,
        statusCode: StatusCodes.BAD_REQUEST,
        detail: "",
      });
    }
  }

  async createRole(roleValue: string, permissions: TUserPermission[]) {
    this.checkInvalidPermissions(permissions);

    let role = new Role({
      value: roleValue,
      permissions,
    });
    role.preCreate();
    await RoleModel.create(role);
  }

  async existRole(roleValue: string) {
    return await RoleModel.exists({ value: roleValue });
  }

  async updateRole(roleValue: string, permissions: TUserPermission[]) {
    this.checkInvalidPermissions(permissions);

    let role = new Role({
      value: roleValue,
      permissions,
    });
    role.preUpdate();
    await RoleModel.updateOne({ value: roleValue }, role);
  }

  async deleteRole(roleValue: string) {
    await RoleModel.deleteOne({ value: roleValue });
  }

  async can(roleValue: string, permission: string) {
    return await RoleModel.exists({
      value: roleValue,
      permissions: { $all: [permission] },
    });
  }
}
