import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { User } from '../user/user.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Logging } from '../logging/logging.entity';
import 'dotenv/config';

const mainEntities = [User, Attendance];
const commonMainConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: mainEntities,
  synchronize: false,
  logging: true,
};

export const typeOrmModuleConfig: TypeOrmModuleOptions = {
  ...commonMainConfig,
};

export const dataSourceConfig: DataSourceOptions = {
  ...commonMainConfig,
  migrations: ['./src/migrations/*.ts'],
};

const loggingEntities = [Logging];
export const logDbConfig: DataSourceOptions = {
  type: 'postgres' as const,
  host: process.env.LOG_DB_HOST,
  port: parseInt(process.env.LOG_DB_PORT || '5432'),
  username: process.env.LOG_DB_USERNAME,
  password: process.env.LOG_DB_PASSWORD,
  database: process.env.LOG_DB_NAME,
  entities: loggingEntities,
  synchronize: false,
  logging: true,
};

export const typeOrmModuleLogConfig: TypeOrmModuleOptions = {
  name: process.env.LOG_DB_NAME,
  ...logDbConfig,
};

export const dataSourceLogConfig: DataSourceOptions = {
  name: process.env.LOG_DB_NAME,
  ...logDbConfig,
  migrations: ['./src/migrations/log/*.ts'],
};
