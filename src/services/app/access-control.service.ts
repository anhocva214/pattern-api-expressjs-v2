import {
  ALL_PERMISSIONS,
  USER_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
} from "@helpers/access-control.helper";
import { AppError } from "@models/error";
import Role, { RoleModel, TUserPermission } from "@models/role.model";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import logger from "../logger.service";

export default class AccessControlService {
  private allPermissions = ALL_PERMISSIONS;
  private userPermission = USER_PERMISSIONS;

  constructor() {}

  async init() {
    if (!(await this.existRole("super_admin"))) {
      await this.createRole({
        value: "super_admin",
        permissions: [...this.allPermissions],
        alowUpdate: false,
      });
      logger.info("Create role super_admin successfully");
    } else {
      await this.updateRole({
        value: "super_admin",
        permissions: [...this.allPermissions],
        alowUpdate: false,
      });
      logger.info("Update role super_admin successfully");
    }

    if (!(await this.existRole("user"))) {
      await this.createRole({
        value: "user",
        permissions: [...this.userPermission],
        alowUpdate: false,
      });
      logger.info("Create role user successfully");
    } else {
      await this.updateRole({
        value: "user",
        permissions: [...this.userPermission],
        alowUpdate: false,
      });
      logger.info("Update role user successfully");
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

  async createRole(data: {
    value: string;
    permissions: TUserPermission[];
    alowUpdate: boolean;
  }) {
    this.checkInvalidPermissions(data.permissions);

    let role = new Role(data);
    role.preCreate();
    let newData = await RoleModel.create(role);
    return new Role(newData);
  }

  async existRole(roleValue: string) {
    return await RoleModel.exists({ value: roleValue });
  }

  async updateRole(data: {
    value: string;
    permissions: TUserPermission[];
    alowUpdate: boolean;
  }) {
    this.checkInvalidPermissions(data.permissions);

    let role = new Role(data);
    role.preUpdate();
    await RoleModel.updateOne({ value: data.value }, role);
    let newData = new Role(
      (await RoleModel.findOne({ value: data.value })) as any
    );
    return newData;
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

  getAllPermissions() {
    return _.difference(this.allPermissions, [...SUPER_ADMIN_PERMISSIONS]);
  }
}
