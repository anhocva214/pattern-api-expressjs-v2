import { FileUpload } from "@models/upload.model";
import { User, UserModel } from "@models/user.model";
import CloudinaryService from "@services/cloudinary.service";
import _ from "lodash";
import bcrypt from "bcrypt";


export default class UserService {
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
  }

  async createSuperAdmin(data: {
    fullname: string;
    email: string;
    password: string;
    keyCreate: string;
  }) {
    let user = new User(data);
    user.role = "super_admin";
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
    user.preCreate();
    let newUser = await UserModel.create(user);
    return new User(newUser as any).toDataResponse();
  }

  async updatePasswordSuperAdmin(data: {
    email: string;
    password: string;
    keyCreate: string;
  }) {
    let user = new User(await UserModel.findOne({email: data.email}) as any);
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt());
    user.preUpdate();
    await UserModel.updateOne({_id: user.id}, user)
    return new User(await UserModel.findOne({email: data.email}) as any).toDataResponse();
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
