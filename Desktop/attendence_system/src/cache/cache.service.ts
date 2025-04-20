import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { REDIS_KEYS, CACHE_TTL } from '../shared/utils/constants';

@Injectable()
export class CacheService implements OnModuleInit {
  private client;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    if (this.isConnected) return;

    this.client = createClient({
      url: `redis://${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    await this.client.connect();
    this.isConnected = true;
  }

  async setAttendance(date: string, classId: string, data: any): Promise<void> {
    await this.connect();
    const key = REDIS_KEYS.ATTENDANCE(date, classId);
    await this.client.set(key, JSON.stringify(data), {
      EX: CACHE_TTL.ATTENDANCE,
    });
  }

  async getAttendance(date: string, classId: string): Promise<any> {
    await this.connect();
    const key = REDIS_KEYS.ATTENDANCE(date, classId);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async addToSyncQueue(userId: string, data: any): Promise<void> {
    await this.connect();
    const key = REDIS_KEYS.SYNC_QUEUE(userId);
    await this.client.rPush(key, JSON.stringify(data));
    await this.client.expire(key, CACHE_TTL.SYNC_QUEUE);
  }

  async getSyncQueue(userId: string): Promise<any[]> {
    await this.connect();
    const key = REDIS_KEYS.SYNC_QUEUE(userId);
    const data = await this.client.lRange(key, 0, -1);
    return data.map((item) => JSON.parse(item));
  }

  async clearSyncQueue(userId: string): Promise<void> {
    await this.connect();
    const key = REDIS_KEYS.SYNC_QUEUE(userId);
    await this.client.del(key);
  }

  async setLastSync(userId: string, timestamp: Date): Promise<void> {
    await this.connect();
    const key = REDIS_KEYS.LAST_SYNC(userId);
    await this.client.set(key, timestamp.toISOString());
  }

  async getLastSync(userId: string): Promise<Date | null> {
    await this.connect();
    const key = REDIS_KEYS.LAST_SYNC(userId);
    const timestamp = await this.client.get(key);
    return timestamp ? new Date(timestamp) : null;
  }
}
