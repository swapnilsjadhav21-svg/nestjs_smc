import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreateAppCitizenDto } from './dto/app_citizen.dto';
import { AppCitizen } from './entities/appCitizen.entity';
import { AppCitizenService } from './app-citizen.service';


@ApiTags('AppCitizen')
@Controller('core/AppCitizen')
export class AppCitizenController extends BaseCrudController<AppCitizen, CreateAppCitizenDto> {
	constructor(private readonly appCitizenService: AppCitizenService) {
		super(appCitizenService);
	}

	@Post()
	@ApiOperation({ summary: 'Create AppCitizen' })
	override create(@Body() dto: CreateAppCitizenDto): Promise<AppCitizen> {
		return super.create(dto);
	}
}
