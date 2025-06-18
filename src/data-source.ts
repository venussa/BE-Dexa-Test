import { DataSource } from 'typeorm';
import { dataSourceConfig } from '@src/config/db.config';

export const AppDataSource = new DataSource(dataSourceConfig);