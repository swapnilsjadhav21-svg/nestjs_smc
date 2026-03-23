import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { ComplaintsModule } from './complaints/complaints.module';
//import { SequelizeModule } from "@nestjs/sequelize"
import { DepartmentModule } from './modules/department/department.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      //autoLoadEntities: true, // 🔥 IMPORTANT
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: false, // ⚠️ dev only
      logging:true,
    }),
    DepartmentModule,
  ],
})
export class AppModule { }
