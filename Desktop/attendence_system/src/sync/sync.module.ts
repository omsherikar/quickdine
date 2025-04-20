import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
