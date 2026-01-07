import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private client: RedisClientType;
  private readonly ttlHours: number;
  private isConnected = false;

  constructor() {
    this.ttlHours = parseInt(process.env.CACHE_TTL_HOURS || '24');
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
      this.isConnected = false;
    });
    
    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.connect().catch((err) => {
      console.error('Redis connection failed:', err);
      this.isConnected = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      return null;
    }
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    try {
      const ttl = ttlSeconds || this.ttlHours * 3600;
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async clear(pattern: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error(`Cache clear error for pattern ${pattern}:`, error);
    }
  }

  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
