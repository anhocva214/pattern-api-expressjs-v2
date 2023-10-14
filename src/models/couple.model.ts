import { Schema, model } from "mongoose";
import BaseModel from ".";
import { User } from "./user.model";

export const LIST_COUPLE_STATUS = ["dating", "broke_up"];
export type TCoupleStatus = (typeof LIST_COUPLE_STATUS)[number];

export class Couple extends BaseModel {
  userRequestId: string;
  userApproveId: string;
  status: TCoupleStatus;

  constructor(obj?: Partial<Couple>) {
    super(obj as any);
    this.userApproveId = obj?.userApproveId || "";
    this.userRequestId = obj?.userRequestId || "";
    this.status = obj?.status || "";
  }
}

interface ICoupleResponse extends BaseModel {
  userApprove: User;
  userRequest: User;
  status: TCoupleStatus;
}

const coupleSchema = new Schema({
  userApproveId: { type: Schema.Types.ObjectId, ref: "User" },
  userRequestId: { type: Schema.Types.ObjectId, ref: "User" },
  status: String,
  createdAt: Date,
  updatedAt: Date,
});

coupleSchema.set("toObject", {
  transform: function (doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const CoupleModel = model<User>("Couple", coupleSchema, "Couple");
