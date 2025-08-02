import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketRepliesService } from './ticket-replies.service';
import { TicketRepliesController } from './ticket-replies.controller';
import { TicketReply, TicketReplySchema } from './schemas/ticket-reply.schema';
import { Ticket, TicketSchema } from '../tickets/schemas/ticket.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TicketReply.name, schema: TicketReplySchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TicketRepliesController],
  providers: [TicketRepliesService],
  exports: [TicketRepliesService],
})
export class TicketRepliesModule {}
