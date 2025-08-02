import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSessionsService } from './user-sessions.service';
import { UserSessionsController } from './user-sessions.controller';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserSession.name, schema: UserSessionSchema }]),
  ],
  controllers: [UserSessionsController],
  providers: [UserSessionsService],
  exports: [UserSessionsService],
})
export class UserSessionsModule {}
