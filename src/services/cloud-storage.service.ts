import path from "path";
import fs from "fs";
import { ENV } from "@helpers/env.helper";
import axios from "axios";
import FormData from "form-data";

export class CloudStorageService {
  constructor() {}

  private getPathFile(fileName: string) {
    return path.join(__dirname, `../../uploads/${fileName}`);
  }

  async download(filename: string) {
    return await axios({
      baseURL: ENV.CLOUD_STORAGE_ENDPOINT,
      url: `/download/${filename}`,
      method: "GET",
      headers: {
        key: ENV.CLOUD_STORAGE_KEY,
      },
      responseType: "stream",
    });
  }

  async getArrayBufferFile(filename: string) {
    try {
      let { data } = await axios({
        baseURL: ENV.CLOUD_STORAGE_ENDPOINT,
        url: `/download/${filename}`,
        method: "GET",
        headers: {
          key: ENV.CLOUD_STORAGE_KEY,
        },
        responseType: "arraybuffer",
      });
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async upload(filename: string, options?: { ignoreDeleteFile: boolean }) {
    try {
      let data = new FormData();
      data.append("file", fs.createReadStream(this.getPathFile(filename)));
      let { data: resData } = await axios({
        method: "post",
        maxBodyLength: Infinity,
        baseURL: ENV.CLOUD_STORAGE_ENDPOINT,
        url: "/upload",
        headers: {
          key: ENV.CLOUD_STORAGE_KEY,
        },
        data,
      });
      // console.log(resData)
      !options?.ignoreDeleteFile && fs.unlinkSync(this.getPathFile(filename));
      return {
        filename: resData?.filename,
        size: resData?.size,
        path: `/download/${resData?.filename}`,
      };
    } catch (err) {
      console.log(err);
      return { filename: "", size: 0, path: "" };
    }
  }

  async delete(filename: string) {
    try {
      await axios({
        baseURL: ENV.CLOUD_STORAGE_ENDPOINT,
        url: `/delete/${filename}`,
        method: "GET",
        headers: {
          key: ENV.CLOUD_STORAGE_KEY,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}
