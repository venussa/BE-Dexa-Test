import { DataSource } from 'typeorm';
import { dataSourceConfig } from './config/db.config';

export const AppDataSource = new DataSource(dataSourceConfig);