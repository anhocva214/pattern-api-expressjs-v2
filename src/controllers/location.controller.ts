import { ICities, IDistricts, IWards } from "@models/interface";
import DataCities from "@resources/data-location/cities.json";
import DataDistricts from "@resources/data-location/districts.json";
import DataWards from "@resources/data-location/wards.json";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class LocationController {
  private cities: ICities[];
  private districts: IDistricts[];
  private wards: IWards[];

  constructor() {
    this.cities = DataCities;
    this.districts = DataDistricts;
    this.wards = DataWards;
  }

  getCities(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(this.cities);
    } catch (err) {
      next(err);
    }
  }

  getDistricts(req: Request, res: Response, next: NextFunction) {
    try {
      let citiesCode = req.query.citiesCode;
      res.json(
        citiesCode
          ? this.districts.filter((item) => item.parent_code == citiesCode)
          : this.districts
      );
    } catch (err) {
      next(err);
    }
  }

  getWards(req: Request, res: Response, next: NextFunction) {
    try {
      let districtsCode = req.query.districtsCode;
      res.json(
        districtsCode
          ? this.wards.filter((item) => item.parent_code == districtsCode)
          : this.wards
      );
    } catch (err) {
      next(err);
    }
  }

  getText(wardsCode: string){
    return this.wards.find(item => item.code == wardsCode)?.path_with_type || ""
  }
}
