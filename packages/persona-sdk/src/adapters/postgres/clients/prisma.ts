/**
 * Prisma client implementation
 */

import type { PrismaClient } from '@prisma/client';
import type { DatabaseClient, QueryResult } from '../adapter.js';

export class PrismaDatabaseClient implements DatabaseClient {
  constructor(private prisma: PrismaClient) {}

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    // Prisma $queryRawUnsafe for dynamic queries
    const rows = await this.prisma.$queryRawUnsafe<T[]>(text, ...(values || []));
    
    return {
      rows,
      rowCount: rows.length,
    };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const txClient = new PrismaTransactionClient(tx as any);
      return callback(txClient);
    });
  }
}

class PrismaTransactionClient implements DatabaseClient {
  constructor(private tx: any) {}

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    const rows = await this.tx.$queryRawUnsafe<T[]>(text, ...(values || []));
    return {
      rows,
      rowCount: rows.length,
    };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
    // Nested transactions in Prisma use the same transaction context
    return callback(this);
  }
}

// Prisma schema for the personas database
export const PRISMA_SCHEMA = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Persona {
  id         String   @id @default(uuid())
  name       String
  age        Int?
  occupation String?
  sex        String?
  attributes Json     @default("{}")
  metadata   Json     @default("{}")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  
  groups PersonaGroupMember[]
  
  @@map("personas")
  @@index([name])
  @@index([age])
  @@index([occupation])
}

model PersonaGroup {
  id          String   @id @default(uuid())
  name        String
  description String?
  metadata    Json     @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  members PersonaGroupMember[]
  
  @@map("persona_groups")
  @@index([name])
}

model PersonaGroupMember {
  id       String   @id @default(uuid())
  personaId String  @map("persona_id")
  groupId   String  @map("group_id")
  joinedAt  DateTime @default(now()) @map("joined_at")
  
  persona Persona      @relation(fields: [personaId], references: [id], onDelete: Cascade)
  group   PersonaGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  
  @@unique([personaId, groupId])
  @@map("persona_group_members")
  @@index([personaId])
  @@index([groupId])
}

model Distribution {
  id         String   @id @default(uuid())
  name       String
  type       String
  parameters Json
  createdAt  DateTime @default(now()) @map("created_at")
  
  @@map("distributions")
}

model GenerationHistory {
  id             String   @id @default(uuid())
  groupId        String?  @map("group_id")
  distributionId String?  @map("distribution_id")
  count          Int
  parameters     Json     @default("{}")
  createdAt      DateTime @default(now()) @map("created_at")
  
  @@map("generation_history")
}
`;