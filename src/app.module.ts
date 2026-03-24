import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { ComplaintModule } from './complaint/complaint.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignationService } from './modules/designation/designation.service';
import { DesignationController } from './modules/designation/designation.controller';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'smc'),
        autoLoadEntities: true,
        //synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'false',
        logging: configService.get<string>('DB_LOGGING', 'true') === 'true',
      }),
    }),
  ],
  controllers: [AppController, DesignationController],
  providers: [AppService, DesignationService],
})
export class AppModule {}
