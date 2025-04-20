import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

interface SyncQueueItem {
  type: string;
  data: any;
}

class WebSocketService {
  private socket: Socket | null = null;
  private syncQueue: SyncQueueItem[] = [];
  private isProcessing = false;
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    
    // Get authentication token
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      this.notifyConnectionListeners(false);
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Initializing WebSocket connection to:', wsUrl);
    this.socket = io(wsUrl, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket'],
      path: '/socket.io/',
      withCredentials: true,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      this.initialized = true;
      this.notifyConnectionListeners(true);
      this.processSyncQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.notifyConnectionListeners(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.notifyConnectionListeners(false);
      
      // If authentication failed, try to reconnect
      if (error.message.includes('auth')) {
        console.log('Authentication error, attempting to reconnect...');
        this.reconnect();
      }
    });

    // Remove any existing event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    // Add event listeners for online/offline status
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    console.log('Browser is online, reconnecting WebSocket...');
    this.reconnect();
  };

  private handleOffline = () => {
    console.log('Browser is offline');
    this.notifyConnectionListeners(false);
  };

  private reconnect(): void {
    console.log('Attempting to reconnect...');
    this.initialized = false;
    if (this.socket) {
      this.socket.connect();
    } else {
      this.initialize();
    }
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  addConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners.push(listener);
  }

  removeConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || !this.socket?.connected || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`Processing sync queue with ${this.syncQueue.length} items`);

    try {
      while (this.syncQueue.length > 0 && this.socket?.connected) {
        const item = this.syncQueue.shift();
        if (item) {
          console.log(`Syncing item: ${item.type}`, item.data);
          await new Promise<void>((resolve, reject) => {
            this.socket?.emit(item.type, item.data, (error: any) => {
              if (error) {
                console.error('Error syncing item:', error);
                reject(error);
              } else {
                console.log(`Successfully synced item: ${item.type}`);
                resolve();
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  addToSyncQueue(type: string, data: any): void {
    console.log(`Adding to sync queue: ${type}`, data);
    this.syncQueue.push({ type, data });
    
    // Save to localStorage for persistence
    this.saveSyncQueueToStorage();
    
    // Try to process the queue if connected
    if (this.socket?.connected) {
      this.processSyncQueue();
    }
  }

  private saveSyncQueueToStorage(): void {
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  loadSyncQueueFromStorage(): void {
    const savedQueue = localStorage.getItem('syncQueue');
    if (savedQueue) {
      this.syncQueue = JSON.parse(savedQueue);
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isSocketConnected(): boolean {
    return Boolean(this.socket?.connected && navigator.onLine);
  }
}

export const websocketService = new WebSocketService();

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      console.log(`Connection status changed: ${connected ? 'connected' : 'disconnected'}`);
      setIsConnected(connected);
    };

    // Initialize WebSocket service
    websocketService.initialize();
    websocketService.addConnectionListener(handleConnectionChange);
    
    // Load any saved sync queue
    websocketService.loadSyncQueueFromStorage();

    // Set initial connection state
    setIsConnected(websocketService.isSocketConnected());

    // Check connection status periodically
    const connectionCheckInterval = setInterval(() => {
      const currentState = websocketService.isSocketConnected();
      if (currentState !== isConnected) {
        setIsConnected(currentState);
      }
    }, 1000);

    return () => {
      clearInterval(connectionCheckInterval);
      websocketService.removeConnectionListener(handleConnectionChange);
    };
  }, [isConnected]);

  const addToSyncQueue = (type: string, data: any) => {
    websocketService.addToSyncQueue(type, data);
  };

  return {
    isConnected,
    addToSyncQueue,
  };
}; 