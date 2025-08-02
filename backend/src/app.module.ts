import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketRepliesModule } from './ticket-replies/ticket-replies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quickdesk',
    ),
    AuthModule,
    UsersModule,
    CategoriesModule,
    TagsModule,
    TicketsModule,
    TicketRepliesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
