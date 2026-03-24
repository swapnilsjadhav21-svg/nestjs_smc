import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { ComplaintsModule } from './complaints/complaints.module';
//import { SequelizeModule } from "@nestjs/sequelize"
import { DepartmentModule } from './modules/reference_tables/department/department.module';
import { DesignationModule } from './modules/reference_tables/designation/designation.module';
import { RoleModule } from './modules/reference_tables/role/role.module';
import { ZoneModule } from './modules/reference_tables/zone/zonemodule';
import { PrabhagModule } from './modules/reference_tables/prabhag/prabhag.module';
import { PrabhagZoneMappingModule } from './modules/reference_tables/prabhag_zone_mapping/prabhagZoneMapping.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
//import { Prabhag } from './modules/prabhag/entities/prabhag.entity';
import { ComplaintTypeModule } from './modules/complaint_system/complaint_type/complaint_type.module';
import { ComplaintAssignmentStrategyModule } from './modules/complaint_system/complaint_assignment_strategy/complaint_assignment_strategy.module';
import { ComplaintAssignmentConfigModule } from './modules/complaint_system/complaint_assignment_config/complaint_assignment_config.module';

import { AppCitizenModule } from './modules/core_tables/app-citizen/app-citizen.module';
import { AppUserModule } from './modules/core_tables/app_user/app_user.module';
import { AppUserRoleModule } from './modules/core_tables/app_user_role/app_user_role.module';
import { ComplaintModule } from './modules/complaint_system/complaint/complaint.module';
import { ComplaintHistoryModule } from './modules/complaint_system/complaint_history/complaint_history.module';
import { ComplaintMediaModule } from './modules/complaint_system/complaint_media/complaint_media.module';

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
    AppCitizenModule,
    AppUserModule,
    AppUserRoleModule,
    ComplaintModule,
    ComplaintHistoryModule,
    ComplaintMediaModule,
  ],
})
export class AppModule {}