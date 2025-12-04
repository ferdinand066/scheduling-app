import 'reflect-metadata';
import { DataSource } from 'typeorm';
import moduleLogger from '../shared/functions/logger';

const logger = moduleLogger('database');

export const AppDataSource = new DataSource({
  name: "default",
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "hapi-boilerplate",
  entities:
    process.env.NODE_ENV === "production"
      ? ["dist/src/database/default/entity/*.js"]
      : ["src/database/default/entity/*.ts"],
  synchronize: true,
  logging: false,
});

export const initializeDatabase = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    logger.info('Initializing database connection...');
    await AppDataSource.initialize();
  }
  return AppDataSource;
};