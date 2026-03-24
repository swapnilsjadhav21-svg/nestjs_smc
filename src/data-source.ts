import 'reflect-metadata';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'smc',
  synchronize: false,
  logging: (process.env.DB_LOGGING ?? 'true') === 'true',
  entities: [
    join(__dirname, '**', '*.entity.{ts,js}'),
    join(__dirname, '**', '*.model.{ts,js}'),
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
