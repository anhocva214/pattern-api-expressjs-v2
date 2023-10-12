import multer from "multer";
import path from "path";
import fs from "fs";

export default class UploadService {
  private storage: multer.StorageEngine;

  constructor() {

    this.storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../uploads"));
      },
      filename: function (req, file, cb) {
        cb(null, `${file.originalname.split(".")[0]}_${Date.now()}.${file.originalname.split(".").pop()}`);
      },
    });
  }

  private getPath(filename: string){
    return path.join(__dirname, `../../uploads/${filename}`);
  }

  instance() {
    return multer({ storage: this.storage });
  }

  delete(filename: string) {
    fs.unlinkSync(this.getPath(filename));
  }
}
