import { Schema, Types, model } from "mongoose";
import BaseModel from ".";

export type TTokenType = "otp" | "access_token" | "reset_password_token" | "captcha"|"";
export class Token<T> extends BaseModel {
  payload: string;
  expiredAt: Date | undefined;
  type: TTokenType;
  data?: T

  constructor(obj?: Omit<Token<T>, "createdAt" | "updatedAt" | "preCreate"|"preUpdate">) {
    super(obj as any);
    this.payload = obj?.payload || "";
    this.expiredAt = obj?.expiredAt;
    this.type = obj?.type || ""
    this.data = obj?.data as any
  }
}

export interface ITokenPayloadCaptcha{
  id: string,
  solution: string
}

export type TOtpMethod = "email" | "sms"
export interface ITokenPayloadOTP{
  to: string
  method: TOtpMethod
  otpCode: string
  id: string
}


const tokenSchema = new Schema({
  payload: String,
  type: String,
  data: Object,
  expiredAt: Date,
  createdAt: Date,
  updatedAt: Date,
});

tokenSchema.set("toObject", {
  transform: function (doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const TokenModel = model<Token<any>>("Token", tokenSchema, "Token");
