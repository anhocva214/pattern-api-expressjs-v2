import { Schema, model } from "mongoose";
import BaseModel from ".";

export const LIST_NOTIFICATION_TYPES = [
  "request_dating",
  "approve_dating",
  "",
] as const;
export type TNotificationType = (typeof LIST_NOTIFICATION_TYPES)[number];

export class Notification<T> extends BaseModel {
  message: string;
  type: TNotificationType;
  toUserIds: string[];
  data: T | {}
  seen: boolean

  constructor(obj?: Partial<Notification<T>>) {
    super(obj as any);
    this.message = obj?.message || "";
    this.type = obj?.type || "";
    this.toUserIds = obj?.toUserIds || [];
    this.data = obj?.data || {}
    this.seen = obj?.seen || false;
  }
}

const notificationSchema = new Schema({
  message: String,
  type: String,
  data: Object,
  seen: Boolean,
  toUserIds: [ { type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: Date,
  updatedAt: Date,
});

notificationSchema.set("toObject", {
  transform: function (doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const NotificationModel = model<Notification<any>>(
  "Notification",
  notificationSchema,
  "Notification"
);
