/**
 * Prisma client implementation
 */
export class PrismaDatabaseClient {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async query(text, values) {
        // Prisma $queryRawUnsafe for dynamic queries
        const rows = await this.prisma.$queryRawUnsafe(text, ...(values || []));
        return {
            rows,
            rowCount: rows.length,
        };
    }
    async transaction(callback) {
        return this.prisma.$transaction(async (tx) => {
            const txClient = new PrismaTransactionClient(tx);
            return callback(txClient);
        });
    }
}
class PrismaTransactionClient {
    tx;
    constructor(tx) {
        this.tx = tx;
    }
    async query(text, values) {
        const rows = await this.tx.$queryRawUnsafe(text, ...(values || []));
        return {
            rows,
            rowCount: rows.length,
        };
    }
    async transaction(callback) {
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
//# sourceMappingURL=prisma.js.map