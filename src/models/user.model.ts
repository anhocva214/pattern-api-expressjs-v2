import { Schema, model } from "mongoose";
import BaseModel from ".";



export class User extends BaseModel {
  avatarURL: string;
  password: string;
  email: string;
  phoneNumber: string;
  fullname: string;
  role: string;
  balance: number;
  locked: boolean;
  fullnameSlug?: string;
  birthday: Date | null

  constructor(obj?: Partial<User>) {
    super(obj as any);
    this.avatarURL = obj?.avatarURL || ""
    this.email = obj?.email || "";
    this.phoneNumber = obj?.phoneNumber || "";
    this.password = obj?.password || "";
    this.fullname = obj?.fullname || "";
    this.role = obj?.role || "user";
    this.balance = obj?.balance || 0;
    this.locked = obj?.locked || false;
    this.fullnameSlug = obj?.fullnameSlug || "";
    this.birthday = obj?.birthday || null
  }

  toDataResponse(): IUserResponse {
    return {
      ...this,
      password: undefined
    };
  }
}

interface IUserResponse extends Omit<User, "password" | "preCreate" | "preUpdate" | "toDataResponse">{

}

const userSchema = new Schema({
  avatarURL: String,
  password: String,
  fullname: String,
  email: String,
  phoneNumber: String,
  role: String,
  balance: Number,
  createdAt: Date,
  updatedAt: Date,
  locked: Boolean,
  fullnameSlug: String,
  birthday: Date
});

userSchema.set("toObject", {
  transform: function (doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const UserModel = model<User>("User", userSchema, "User");
