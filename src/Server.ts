import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";


import { TLang } from "@resources/i18n/interface";
import { RoutersV1 } from "./routes/v1";
import { AppError } from "@models/error";
import logger from "@services/logger.service";
import { ENV } from "@helpers/env.helper";
import moment from "moment";
import { connectMongoDB } from "@config/db.config";
import AccessControlService from "@services/access-control.service";

const app = express();
const { BAD_REQUEST } = StatusCodes;

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(cors());
app.use(express.json({limit: '1500mb'}));
app.use(express.urlencoded({limit: '1500mb', extended: true }));
app.use(cookieParser());


// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}

// Security
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

declare module "express" {
  export interface Request {
    user?: any;
    token?: string;
    lang?: TLang;
    ignoreVerify?: boolean;
    ignoreVerifyFail?: boolean;
    otpTo?: string
  }
}

// Connect database
(async () => {
  await connectMongoDB();
})();


// Handle accept language
function handleLanguage(req: Request, res: Response, next: NextFunction) {
  let lang = req.headers["accept-language"] as any;
  if (lang != "vi" && lang != "en") lang = "vi";
  req.lang = lang;
  next();
}
app.use(handleLanguage);

const buildDate = moment().utc().add(7, "hours");
app.get("/", (req: Request, res: Response) => {
  const openDate = moment().utc().add(7, "hours");
  res.json({
    title: "APIs",
    env: ENV.NODE_ENV,
    version: "1.0",
    buildDate: buildDate.format("DD/MM/YYYY HH:mm:ss A"),
    fromNow: buildDate.from(openDate),
  });
});

// Add APIs
app.use("/v1", RoutersV1());

app.use(
  (err: AppError | any, req: Request, res: Response, next: NextFunction) => {
    if (err) {
      console.log(err);
      res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
      switch (err.constructor) {
        case AppError:
          err.translate(getLocaleFromRequest(req));
          delete err["level"];
          delete err["label"];
          res.json(err);
          break;
        default:
          res.json({ message: "System Error", detail: err });
          break;
      }
    }
    next();
  }
);

function getLocaleFromRequest(req: Request) {
  const locale = req.headers["accept-language"];
  if (locale === "en") return "en";
  return "vi";
}

// Export express instance
export default app;
