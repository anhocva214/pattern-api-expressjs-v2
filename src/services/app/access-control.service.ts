import {
  ALL_PERMISSIONS,
  PERMISSIONS_NOT_ASSIGN,
  PERMISSIONS_OF_USER,
} from "@helpers/access-control.helper";
import { AppError } from "@models/error";
import Role, { RoleModel, TUserPermission } from "@models/role.model";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import logger from "../logger.service";

export default class AccessControlService {
  private allPermissions = ALL_PERMISSIONS;
  private userPermission = PERMISSIONS_OF_USER;

  constructor() {}

  async init() {
    if (!(await this.existRole("super_admin"))) {
      await this.createRole({
        value: "super_admin",
        permissions: [...this.allPermissions],
        editable: false,
      });
      logger.info("Create role super_admin successfully");
    } else {
      await this.deleteRole("super_admin")
      await this.createRole({
        value: "super_admin",
        permissions: [...this.allPermissions],
        editable: false,
      });
      logger.info("Create role super_admin successfully");
    }

    if (!(await this.existRole("user"))) {
      await this.createRole({
        value: "user",
        permissions: [...this.userPermission],
        editable: false,
      });
      logger.info("Create role user successfully");
    } else {
      await this.deleteRole("user")
      await this.createRole({
        value: "user",
        permissions: [...this.userPermission],
        editable: false,
      });
      logger.info("Create role user successfully");
    }
  }

  private checkInvalidPermissions(permissions: TUserPermission[]) {
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

  private async checkEditableRole(roleValue: string){
    let editable = await RoleModel.exists({value: roleValue, editable: true})
    if (!editable) {
      throw new AppError({
        where: "checkEditableRole",
        message: `Role is not editable`,
        statusCode: StatusCodes.BAD_REQUEST,
        detail: "",
      });
    }
  }

  async createRole(data: {
    value: string;
    permissions: TUserPermission[];
    editable: boolean;
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
    editable: boolean;
  }) {
    this.checkInvalidPermissions(data.permissions);
    await this.checkEditableRole(data.value)

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

  async listRoles(){
    let data = (await RoleModel.find({})).map(item => new Role(item))
    return data
  }

  async can(roleValue: string, permission: string) {
    return await RoleModel.exists({
      value: roleValue,
      permissions: { $all: [permission] },
    });
  }

  getAllPermissions() {
    return _.difference(this.allPermissions, [...PERMISSIONS_NOT_ASSIGN]);
  }
}
