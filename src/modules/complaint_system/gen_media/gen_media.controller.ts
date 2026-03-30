import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { GenMediaService } from './gen_media.service';
import { CreateGenMediaDto } from './dto/create-gen-media.dto';
import { GenMedia } from './entities/gen_media.entity';

@ApiTags('Gen Media')
@Controller('media')
export class GenMediaController extends BaseCrudController<GenMedia, CreateGenMediaDto> {
  constructor(private readonly genMediaService: GenMediaService) {
    super(genMediaService);
  }

  @Post()
  @ApiOperation({ summary: 'Upload media file' })
  override create(@Body() dto: CreateGenMediaDto): Promise<GenMedia> {
    return super.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  override findOne(@Param('id', ParseIntPipe) id: number): Promise<GenMedia> {
    return super.findOne(id);
  }
}