import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class AppService {
  getHealth() {
    const mongoConnected = mongoose.connection.readyState === 1;

    return {
      status: 'ok',
      mongo: mongoConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
