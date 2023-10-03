import {
  ITokenPayloadOTP,
  TOtpMethod,
  Token,
  TokenModel,
} from "@models/token.model";
import moment from "moment";
import OtpGenerator from "otp-generator";
import MailService from "./mail.service";
import { v1 as uuidV1 } from "uuid";
import { AppError } from "@models/error";
import { StatusCodes } from "http-status-codes";

export default class OtpService {
  private expiresIn: number;
  private mailService: MailService;

  constructor() {
    this.expiresIn = 15 * 60; // 15 minutes
    this.mailService = new MailService();
  }

  async sendOTP(data: { to: string; method: TOtpMethod }) {
    let otpCode = OtpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    if (data.method == "email") {
      await this.mailService.sendOTP({
        to: data.to,
        otpCode,
      });
    }
    else if (data.method == "sms"){
      otpCode = "123456"
    }

    let tokenObj = new Token<ITokenPayloadOTP>({
      data: {
        ...data,
        otpCode,
        id: uuidV1(),
      },
      expiredAt: moment(new Date()).add(this.expiresIn, "seconds").toDate(),
      type: "otp",
      payload: "",
    });
    tokenObj.preCreate();
    await TokenModel.create(tokenObj);

    return { otpId: tokenObj?.data?.id };
  }

  async verifyOTP(data: { otpId: string; otpCode: string }) {
    let result = await TokenModel.findOne({
      "data.id": data.otpId,
      "data.otpCode": data.otpCode,
    });
    if (result) {
      if (
        moment(new Date(result.expiredAt || new Date())).isBefore(
          moment(new Date())
        )
      ) {
        throw new AppError({
          where: "verifyOTP",
          message: "Mã xác thực đã hết hạn",
          detail: "",
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      } else {
        let otpToken = uuidV1();
        await TokenModel.updateOne(
          { "data.id": data.otpId },
          { payload: otpToken }
        );
        return otpToken;
      }
    } else {
      throw new AppError({
        where: "verifyOTP",
        message: "Mã xác thực không hợp lệ",
        detail: "",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
  }
}
