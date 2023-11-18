import { Schema, model } from "mongoose";
import BaseModel from ".";
import { ALL_PERMISSIONS } from "@helpers/access-control.helper";

export type TUserPermission = (typeof ALL_PERMISSIONS)[number];

export default class Role extends BaseModel {
  value: string;
  permissions: TUserPermission[];
  editable: boolean
  constructor(
    obj?: Omit<Role, "createdAt" | "updatedAt" | "preCreate" | "preUpdate">
  ) {
    super(obj as any);
    this.value = obj?.value || "";
    this.permissions = obj?.permissions || [];
    this.editable = obj?.editable || false
  }
}

const roleSchema = new Schema({
  value: String,
  permissions: [String],
  editable: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

roleSchema.set("toObject", {
  transform: function (doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const RoleModel = model<Role>("Role", roleSchema, "Role");
