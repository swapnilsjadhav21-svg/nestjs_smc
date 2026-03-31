import { Controller, Get, Param, Body, ParseIntPipe, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { GenMediaService } from './gen_media.service';
import { CreateGenMediaDto } from './dto/create-gen-media.dto';
import { GenMedia } from './entities/gen_media.entity';

@ApiTags('Media')
@Controller('media')
export class GenMediaController extends BaseCrudController<GenMedia, CreateGenMediaDto> {
  constructor(private readonly genMediaService: GenMediaService) {
    super(genMediaService);
  }

  // hides the base class POST from swagger and overrides it
  @Post()
  @ApiExcludeEndpoint()
  override create(@Body() dto: CreateGenMediaDto): Promise<GenMedia> {
    return super.create(dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads');
        },
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only jpg, jpeg, png files are allowed'), false);
        }
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File): Promise<GenMedia> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.genMediaService.upload(file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  override findOne(@Param('id', ParseIntPipe) id: number): Promise<GenMedia> {
    return this.genMediaService.findOne(id);
  }
}