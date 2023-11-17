import { FileUpload } from "@models/upload.model";
import { User, UserModel } from "@models/user.model";
import CloudinaryService from "@services/cloudinary.service";
import _ from "lodash";

export default class UserService {
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
  }

  async update(
    userId: string,
    obj: {
      avatarFile: FileUpload;
      fullname: string;
      birthday: Date;
      gender: string;
    }
  ) {
    let user = new User((await UserModel.findById(userId)) as any);

    if (obj.avatarFile.path) {
      let avatarURL = await this.cloudinaryService.upload(obj.avatarFile);
      if (user.avatarURL) await this.cloudinaryService.delete(user.avatarURL);
      user.avatarURL = avatarURL;
    }

    await UserModel.updateOne(
      { _id: userId },
      {
        avatarURL: user.avatarURL,
        fullname: obj.fullname,
        birthday: obj.birthday,
        gender: obj?.gender,
        updatedInfo: true,
        updatedAt: new Date(),
      }
    );

    let newUser = new User((await UserModel.findById(userId)) as any);

    return newUser.toDataResponse();
  }

  async getMyInfo(user: User) {
    return { ...user };
  }
}
