import { ENV } from "@helpers/env.helper";
import AccessControlService from "@services/access-control.service";
import logger from "@services/logger.service";
import { connect, connection } from "mongoose";

export async function connectMongoDB(): Promise<void> {
  try {
    await connect(
      `mongodb://${ENV.MONGO_USER}:${ENV.MONGO_PASS}@${ENV.MONGO_HOST}:${ENV.MONGO_PORT}`,
      {
        dbName: ENV.MONGO_DB,
        connectTimeoutMS: 5000
      }
    );
    logger.info("Connect database success");
    await new AccessControlService().init();
  } catch (err) {
    logger.error(err);
    setTimeout(() => {
        logger.info("Reconnecting database...")
        connectMongoDB()
    }, 3000);
  }
}

export async function closeMongoDB(): Promise<void> {
  await connection.close();
}
