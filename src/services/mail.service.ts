import { ENV } from "@helpers/env.helper";
import { User } from "@models/user.model";
import { Transporter, createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export default class MailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    this.transporter = createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: ENV.MAIL_USER,
        pass: ENV.MAIL_PASSWORD,
      },
    });
  }

  async sendLinkResetPassword({
    to,
    token,
    user,
  }: {
    token: string;
    to: string;
    user: User;
  }) {
    const options = {
      from: ENV.MAIL_USER,
      to,
      subject: "Tailieure.net - ĐẶT LẠI MẬT KHẨU",
      html: `
      Sử dụng liên kết này để đặt lại mật khẩu của bạn. Liên kết chỉ có hiệu lực trong 15 phút.
      <br/> <br/>
      Tailieure.net
      <br/> <br/>
      Chào ${user.fullname},
      <br/> <br/>
      Gần đây, bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Tailieure.net của mình. Sử dụng nút bên dưới để đặt lại. Việc đặt lại mật khẩu này chỉ có hiệu lực trong 15 phút tới.
      <br/> <br/>
      <a href="https://tailieure.net/dat-lai-mat-khau/${token}">Thiết lập mật khẩu mới</a>
      <br/> <br/>
      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      <br/> <br/>
      Trân trọng, <br/>
      Đội ngũ Tailieure.net
      <br/> <br/>
      Nếu bạn gặp sự cố với nút ở trên, hãy sao chép và dán URL bên dưới vào trình duyệt web của bạn.
      <br/> <br/>
      https://tailieure.net/dat-lai-mat-khau/${token}
      `,
    };

    await this.transporter.sendMail(options);
  }

  async sendOTP({
    to,
    otpCode,
  }: {
    otpCode: string;
    to: string;
  }) {
    const options = {
      from: ENV.MAIL_USER,
      to,
      subject: `Tailieure.net - MÃ XÁC THỰC OTP - ${otpCode}`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email gửi mã OTP</title>
      </head>
      <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Chào bạn,</h2>
              <p>Đây là mã OTP để xác thực email của bạn: <strong>${otpCode}</strong></p>
              <p>Mã OTP chỉ có hiệu lực trong vòng 15 phút. Vui lòng không chia sẻ mã này với bất kỳ ai khác.</p>
              <p>Nếu bạn không yêu cầu mã OTP này, xin vui lòng bỏ qua email này hoặc liên hệ với chúng tôi ngay.</p>
              <br>
              <p>Trân trọng,</p>
              <p>Đội ngũ hỗ trợ</p>
          </div>
      </body>
      </html>
      `,
    };

    await this.transporter.sendMail(options);
  }

  async alertResearchPost({
    to,
    fullname,
    title,
    link,
  }: {
    fullname: string;
    to: string;
    title: string;
    link: string;
  }) {
    const options = {
      from: ENV.MAIL_USER,
      to,
      subject: `Tailieure.net - Thông tin nghiên cứu - ${title}`,
      html: `
        <p>Chào ${fullname},</p>

        <p>Chúng tôi hy vọng bạn đang có một ngày tốt lành! Chúng tôi rất vui mừng thông báo với bạn rằng chúng tôi đã có bài viết mới trong mục <strong>Thông tin nghiên cứu</strong>.</p>

        <p><strong>Tiêu đề:</strong>  <a href="${link}" target="_blank" style="text-decoration: none; color: #fa802a;">${title}</a> </p>

        <p>Chúng tôi hy vọng rằng bài viết này sẽ mang lại cho bạn những thông tin hữu ích và thú vị. Đừng ngần ngại ghé thăm trang website của chúng tôi để đọc bài viết đầy đủ và khám phá thêm nhiều nội dung hấp dẫn khác.</p>

        <p>Nếu bạn có bất kỳ câu hỏi hoặc ý kiến đóng góp nào, xin vui lòng liên hệ với chúng tôi. Chúng tôi luôn trân trọng sự phản hồi của bạn.</p>

        <p>Trân trọng,<br>
        Đội ngũ Tailieure.net<br>

        <button style="padding: 5px 20px; background-color: #fa802a; color: white; border: none; text-decoration: none; margin-top: 10px; border-radius: 5px; font-weight: 500;">
          <a href="${link}" target="_blank" style="text-decoration: none; color: white;">Xem chi tiết</a>
        </button>
      `,
    };

    try {
      await this.transporter.sendMail(options);
    } catch (err) {
      console.log(err);
    }
  }

  async resulTUserFollowAlertResearchPost({
    to,
    fullname,
  }: {
    fullname: string;
    to: string;
  }) {
    const options = {
      from: ENV.MAIL_USER,
      to,
      subject: "Tailieure.net - Thông tin nghiên cứu - Kích hoạt thành công",
      html: `
      <html>
        <body>
          <p>Chào ${fullname},</p>
          <p>Cảm ơn bạn đã kích hoạt chức năng nhận bài viết mới nhất về email. Từ giờ trở đi, bạn sẽ nhận được thông báo về các bài viết mới trong mục <strong>Thông tin nghiên cứu</strong>.</p>
          <p>Xin cảm ơn và chúc bạn có trải nghiệm tuyệt vời!</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ Tailieure.net</p>
        </body>
      </html>
      `,
    };

    try {
      await this.transporter.sendMail(options);
    } catch (err) {
      console.log(err);
    }
  }
}
