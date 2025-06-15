import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { User } from '../user/user.entity';
import { Attendance } from '../attendance/attendance.entity';
import 'dotenv/config';

const commonConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Attendance],
  synchronize: false,
  logging: true,
};

export const typeOrmModuleConfig: TypeOrmModuleOptions = {
  ...commonConfig,
};

export const dataSourceConfig: DataSourceOptions = {
  ...commonConfig,
  migrations: ['./src/migrations/*.ts'],
};