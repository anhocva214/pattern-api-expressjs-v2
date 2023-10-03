export class FileUpload {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    filename: string
    path: string
    constructor(obj: FileUpload) {
        this.fieldname= obj?.fieldname || "";
        this.originalname = obj?.originalname || "";
        this.encoding = obj?.encoding || "";
        this.mimetype = obj?.mimetype || "";
        this.size = obj?.size || 0
        this.filename = obj?.filename || ""
        this.path = obj?.path || ""
    }
}