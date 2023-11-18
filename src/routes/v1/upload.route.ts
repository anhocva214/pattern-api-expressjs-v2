import { UploadController } from '@controllers/upload.controller';
import { Router } from 'express';
import BaseRouter from '../base.route';


export default class UploadRouter extends BaseRouter {
    private controller: UploadController;

    constructor(router: Router) {
        super({pathBase: '/uploads', router})
        this.controller = new UploadController();
    }

    instance() {
        this.router.delete(
            this.path('/file/:filename'),
            this.controller.cloudDelete.bind(this.controller)
        )
        this.router.post(
            this.path('/file'),
            this.controller.multer.single('file'),
            this.controller.cloudUpload.bind(this.controller)
        )
    }
}
