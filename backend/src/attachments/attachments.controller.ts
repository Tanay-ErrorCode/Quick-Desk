import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile,
  Res,
  NotFoundException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentsService } from './attachments.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Controller('api/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('tickets/:ticketId/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, callback) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type'), false);
      }
    },
  }))
  async uploadFile(
    @Param('ticketId') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }

    const attachment = await this.attachmentsService.create(
      ticketId,
      {
        original_name: file.originalname,
        stored_name: file.filename,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
      },
      req.user.userId,
    );

    return {
      success: true,
      message: 'File uploaded successfully',
      attachment: {
        id: (attachment as any)._id,
        original_name: attachment.original_name,
        file_size: attachment.file_size,
        download_url: `/api/attachments/${(attachment as any)._id}/download`,
      },
    };
  }

  @Get('tickets/:ticketId')
  async getTicketAttachments(@Param('ticketId') ticketId: string) {
    const attachments = await this.attachmentsService.findByTicket(ticketId);
    return {
      success: true,
      attachments,
    };
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.attachmentsService.findOne(id);
    
    if (!fs.existsSync(attachment.file_path)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
    res.setHeader('Content-Type', attachment.mime_type);
    
    return res.sendFile(attachment.file_path, { root: '.' });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.attachmentsService.remove(id, req.user.userId);
    return {
      success: true,
      message: 'Attachment deleted successfully',
    };
  }
}
