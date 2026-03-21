import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComplaintsModule } from './complaints/complaints.module';
import { SequelizeModule } from "@nestjs/sequelize"

@Module({
  imports: [ComplaintsModule, SequelizeModule.forRoot({
    dialect: "postgres",
    host: "Localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "smc_complaint",
    autoLoadModels: true,
    synchronize: true,
    //logging:console.log
  })],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
