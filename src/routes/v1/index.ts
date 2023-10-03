import { Router } from 'express';
import UploadRouter from './upload.route';
import UsersRouter from './user.route'
import AuthRouter from './auth.route';
import LocationRouter from './location.route';




export function RoutersV1(){
    const router = Router();
    new UsersRouter(router).instance();
    new UploadRouter(router).instance();
    new AuthRouter(router).instance()
    new LocationRouter(router).instance()
    return router
}