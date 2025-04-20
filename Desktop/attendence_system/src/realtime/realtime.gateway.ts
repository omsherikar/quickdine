import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../cache/cache.service';
import { WEBSOCKET_EVENTS } from '../shared/utils/constants';
import { MarkAttendanceDto } from '../shared/dto/attendance.dto';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket'],
  path: '/socket.io/',
  serveClient: false,
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up any necessary resources
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.JOIN_CLASS)
  async handleJoinClass(client: Socket, classId: string) {
    client.join(`class_${classId}`);
    client.emit(WEBSOCKET_EVENTS.JOIN_CLASS, { classId });
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.LEAVE_CLASS)
  async handleLeaveClass(client: Socket, classId: string) {
    client.leave(`class_${classId}`);
    client.emit(WEBSOCKET_EVENTS.LEAVE_CLASS, { classId });
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.MARK_ATTENDANCE)
  async handleMarkAttendance(client: Socket, data: MarkAttendanceDto) {
    try {
      const { classId, date } = data;
      const room = `class_${classId}`;
      const dateStr = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

      // Update cache
      await this.cacheService.setAttendance(dateStr, classId, {
        ...data,
        updatedBy: client.data.user.id,
        updatedAt: new Date(),
      });

      // Broadcast to room
      this.server.to(room).emit(WEBSOCKET_EVENTS.ATTENDANCE_UPDATE, {
        ...data,
        updatedBy: client.data.user.id,
        updatedAt: new Date(),
      });

      client.emit(WEBSOCKET_EVENTS.MARK_ATTENDANCE, { success: true });
    } catch (error) {
      client.emit(WEBSOCKET_EVENTS.ERROR, { message: 'Failed to mark attendance' });
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.SYNC_REQUEST)
  async handleSyncRequest(client: Socket, { lastSync }: { lastSync: Date }) {
    try {
      const userId = client.data.user.id;
      const syncQueue = await this.cacheService.getSyncQueue(userId);
      
      client.emit(WEBSOCKET_EVENTS.SYNC_REQUEST, {
        success: true,
        data: syncQueue,
      });

      // Clear sync queue after successful sync
      await this.cacheService.clearSyncQueue(userId);
      await this.cacheService.setLastSync(userId, new Date());
    } catch (error) {
      client.emit(WEBSOCKET_EVENTS.ERROR, { message: 'Failed to sync data' });
    }
  }
}
