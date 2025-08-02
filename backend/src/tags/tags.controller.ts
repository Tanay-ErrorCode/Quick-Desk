import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.create(createTagDto);
    return {
      success: true,
      message: 'Tag created successfully',
      data: tag,
    };
  }

  @Get()
  async findAll() {
    const tags = await this.tagsService.findAll();
    return {
      success: true,
      message: 'Tags retrieved successfully',
      data: tags,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tag = await this.tagsService.findOne(id);
    return {
      success: true,
      message: 'Tag retrieved successfully',
      data: tag,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    const tag = await this.tagsService.update(id, updateTagDto);
    return {
      success: true,
      message: 'Tag updated successfully',
      data: tag,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.tagsService.remove(id);
    return {
      success: true,
      message: 'Tag deleted successfully',
    };
  }
}
