import { DataSource } from 'typeorm';
import { dataSourceLogConfig } from './config/db.config';

export const LogDataSource = new DataSource(dataSourceLogConfig);