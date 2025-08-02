import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<TagDocument> {
    // Verify category exists
    const category = await this.categoryModel.findById(
      createTagDto.category_id,
    );
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Check if tag with same name already exists in this category
    const existingTag = await this.tagModel.findOne({
      name: createTagDto.name,
      category_id: createTagDto.category_id,
    });

    if (existingTag) {
      throw new BadRequestException(
        'Tag with this name already exists in this category',
      );
    }

    const tagData = {
      ...createTagDto,
      category_id: new Types.ObjectId(createTagDto.category_id),
    };

    const tag = new this.tagModel(tagData);
    return tag.save();
  }

  async findAll(): Promise<TagDocument[]> {
    return this.tagModel
      .find({ is_active: true })
      .populate('category_id', 'name color')
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<TagDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tag ID');
    }

    const tag = await this.tagModel
      .findById(id)
      .populate('category_id', 'name color')
      .exec();

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<TagDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tag ID');
    }

    // If category_id is being updated, verify new category exists
    if (updateTagDto.category_id) {
      const category = await this.categoryModel.findById(
        updateTagDto.category_id,
      );
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Check if another tag with same name exists in same category (excluding current tag)
    if (updateTagDto.name || updateTagDto.category_id) {
      const currentTag = await this.tagModel.findById(id);
      if (!currentTag) {
        throw new NotFoundException('Tag not found');
      }

      const checkName = updateTagDto.name || currentTag.name;
      const checkCategoryId =
        updateTagDto.category_id || currentTag.category_id;

      const existingTag = await this.tagModel.findOne({
        name: checkName,
        category_id: checkCategoryId,
        _id: { $ne: id },
      });

      if (existingTag) {
        throw new BadRequestException(
          'Tag with this name already exists in this category',
        );
      }
    }

    const updateData: any = { ...updateTagDto };
    if (updateTagDto.category_id) {
      updateData.category_id = new Types.ObjectId(updateTagDto.category_id);
    }

    const updatedTag = await this.tagModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category_id', 'name color')
      .exec();

    if (!updatedTag) {
      throw new NotFoundException('Tag not found');
    }

    return updatedTag;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tag ID');
    }

    const result = await this.tagModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Tag not found');
    }
  }
}
