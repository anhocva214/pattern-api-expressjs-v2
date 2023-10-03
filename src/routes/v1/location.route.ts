import { Router } from 'express';
import BaseRouter from '../base.route';
import LocationController from '@controllers/location.controller';


export default class LocationRouter extends BaseRouter {
    private controller: LocationController;
    // private validator: OrdersValidator;

    constructor(router: Router) {
        super({pathBase: '/locations', router})
        this.controller = new LocationController();
        // this.validator = new OrdersValidator();
    }

    instance() {
        this.router.get(
            this.path('/cities'),
            this.controller.getCities.bind(this.controller)
        )
        this.router.get(
            this.path('/districts'),
            this.controller.getDistricts.bind(this.controller)
        )
        this.router.get(
            this.path('/wards'),
            this.controller.getWards.bind(this.controller)
        )
    }
}
