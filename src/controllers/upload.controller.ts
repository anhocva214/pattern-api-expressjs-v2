import { FileUpload } from "@models/upload.model";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import path from "path";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); //Appending extension
  },
});
  


export class UploadController {
    public upload: multer.Multer
    public multer: multer.Multer

    constructor(){
        this.upload = multer()
        this.multer = multer({storage})
    }

    async cloudUpload(req: Request, res: Response, next: NextFunction){
        try{
            let file = req.file;
            if (!file){
                return res.status(StatusCodes.BAD_REQUEST).send({message: "File not found"})
            }
            // let {url} = await this.googleCloudService.uploadFile(file.filename)

            // return res.json(url)
        }
        catch(err){
            next(err)
        }
    }

    async cloudDelete(req: Request, res: Response, next: NextFunction){
        try{
            let filename = req.params.filename?.toString() || "";
            // await this.googleCloudService.deleteFile(filename)         
            return res.json({})
        }
        catch(err){
            next(err)
        }
    }
}