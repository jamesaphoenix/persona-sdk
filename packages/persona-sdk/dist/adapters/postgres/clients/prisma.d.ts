/**
 * Prisma client implementation
 */
type PrismaClient = any;
import type { DatabaseClient, QueryResult } from '../adapter.js';
export declare class PrismaDatabaseClient implements DatabaseClient {
    private prisma;
    constructor(prisma: PrismaClient);
    query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>>;
    transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
}
export declare const PRISMA_SCHEMA = "\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel Persona {\n  id         String   @id @default(uuid())\n  name       String\n  age        Int?\n  occupation String?\n  sex        String?\n  attributes Json     @default(\"{}\")\n  metadata   Json     @default(\"{}\")\n  createdAt  DateTime @default(now()) @map(\"created_at\")\n  updatedAt  DateTime @updatedAt @map(\"updated_at\")\n  \n  groups PersonaGroupMember[]\n  \n  @@map(\"personas\")\n  @@index([name])\n  @@index([age])\n  @@index([occupation])\n}\n\nmodel PersonaGroup {\n  id          String   @id @default(uuid())\n  name        String\n  description String?\n  metadata    Json     @default(\"{}\")\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n  \n  members PersonaGroupMember[]\n  \n  @@map(\"persona_groups\")\n  @@index([name])\n}\n\nmodel PersonaGroupMember {\n  id       String   @id @default(uuid())\n  personaId String  @map(\"persona_id\")\n  groupId   String  @map(\"group_id\")\n  joinedAt  DateTime @default(now()) @map(\"joined_at\")\n  \n  persona Persona      @relation(fields: [personaId], references: [id], onDelete: Cascade)\n  group   PersonaGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)\n  \n  @@unique([personaId, groupId])\n  @@map(\"persona_group_members\")\n  @@index([personaId])\n  @@index([groupId])\n}\n\nmodel Distribution {\n  id         String   @id @default(uuid())\n  name       String\n  type       String\n  parameters Json\n  createdAt  DateTime @default(now()) @map(\"created_at\")\n  \n  @@map(\"distributions\")\n}\n\nmodel GenerationHistory {\n  id             String   @id @default(uuid())\n  groupId        String?  @map(\"group_id\")\n  distributionId String?  @map(\"distribution_id\")\n  count          Int\n  parameters     Json     @default(\"{}\")\n  createdAt      DateTime @default(now()) @map(\"created_at\")\n  \n  @@map(\"generation_history\")\n}\n";
export {};
//# sourceMappingURL=prisma.d.ts.map