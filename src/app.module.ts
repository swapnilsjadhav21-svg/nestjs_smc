import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { ComplaintsModule } from './complaints/complaints.module';
//import { SequelizeModule } from "@nestjs/sequelize"
import { DepartmentModule } from './refernce_table/department/department.module';
import { DesignationModule } from './refernce_table/designation/designation.module';
import { RoleModule } from './refernce_table/role/role.module';
import { ZoneModule } from './refernce_table/zone/zonemodule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
//import { Prabhag } from './modules/prabhag/entities/prabhag.entity';
import { PrabhagModule } from './refernce_table/prabhag/prabhag.module';
import { PrabhagZoneMappingModule } from './refernce_table/prabhag_zone_mapping/prabhag_zone_mapping.module';
import { ComplaintTypeModule } from './modules/complaint_system/complaint_type/complaint_type.module';
import { ComplaintAssignmentStrategyModule } from './modules/complaint_system/complaint_assignment_strategy/complaint_assignment_strategy.module';
import { ComplaintAssignmentConfigModule } from './modules/complaint_system/complaint_assignment_config/complaint_assignment_config.module';

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
    DesignationModule,
    RoleModule,
    ZoneModule,
    PrabhagModule,
    PrabhagZoneMappingModule,
    ComplaintTypeModule,
    ComplaintAssignmentStrategyModule,
    ComplaintAssignmentConfigModule,
  ],
})
export class AppModule { }
