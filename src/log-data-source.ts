import { DataSource } from 'typeorm';
import { dataSourceLogConfig } from '@src/config/db.config';

export const LogDataSource = new DataSource(dataSourceLogConfig);