import { ENV } from "@helpers/env.helper";
import { FileUpload } from "@models/upload.model";
import { v2 as cloudinary } from "cloudinary";
import UploadService from "./upload.service";

          
cloudinary.config({ 
  cloud_name: 'dtqwntru9', 
  api_key: '448623926833742', 
  api_secret: 'EykpbfyklaowoZRunt70EERn3fU' 
});

export default class CloudinaryService {
  private folderName: string;
  private uploadService: UploadService;

  constructor() {
    this.folderName = ENV.NODE_ENV || "development";
    this.uploadService = new UploadService();
  }

  async upload(file: FileUpload) {
    try {
      let res = await cloudinary.uploader.upload(file.path, {
        folder: this.folderName,
      });
      this.uploadService.delete(file.filename);
      return res.url;
    } catch (err) {
      console.log(err);
      return "";
    }
  }

  async delete(url: string) {
    let publicId = url.split("/").pop()?.split(".")[0] || "";
    await cloudinary.uploader.destroy(publicId);
  }

  async uploads(files: FileUpload[]) {
    return await Promise.all(
      files.map(async (file) => await this.upload(file))
    );
  }
}
