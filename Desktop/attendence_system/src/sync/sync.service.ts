import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { SYNC_CONFIG } from '../shared/utils/constants';
import { MarkAttendanceDto, SyncAttendanceDto } from '../shared/dto/attendance.dto';

@Injectable()
export class SyncService {
  constructor(private cacheService: CacheService) {}

  async queueAttendanceForSync(userId: string, attendance: MarkAttendanceDto): Promise<void> {
    await this.cacheService.addToSyncQueue(userId, {
      ...attendance,
      timestamp: new Date(),
      retryCount: 0,
    });
  }

  async processSyncQueue(userId: string): Promise<SyncAttendanceDto> {
    const queue = await this.cacheService.getSyncQueue(userId);
    const lastSync = await this.cacheService.getLastSync(userId);

    // Filter out records that are newer than last sync
    const newRecords = queue.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return !lastSync || recordDate > lastSync;
    });

    return {
      lastSync: new Date(),
      records: newRecords,
    };
  }

  async handleSyncFailure(userId: string, record: any): Promise<void> {
    if (record.retryCount < SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
      // Exponential backoff
      const delay = Math.min(
        SYNC_CONFIG.INITIAL_RETRY_DELAY * Math.pow(2, record.retryCount),
        SYNC_CONFIG.MAX_RETRY_DELAY
      );

      // Re-queue with increased retry count
      await this.cacheService.addToSyncQueue(userId, {
        ...record,
        retryCount: record.retryCount + 1,
        nextRetry: new Date(Date.now() + delay),
      });
    }
  }

  async markSyncComplete(userId: string): Promise<void> {
    await this.cacheService.clearSyncQueue(userId);
    await this.cacheService.setLastSync(userId, new Date());
  }
}
