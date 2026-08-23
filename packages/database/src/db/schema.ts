import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  uniqueIndex,
  vector,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

export const memberRole = pgEnum("member_role", ["owner", "admin", "member"]);
export const crawlStatus = pgEnum("crawl_status", [
  "pending",
  "crawling",
  "completed",
  "failed",
]);
export const orgPlan = pgEnum("org_plan", ["free", "pro"]);

export const organization = pgTable("organization", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  plan: orgPlan("plan").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const organizationMember = pgTable(
  "organization_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull().default("member"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("org_user_idx").on(table.organizationId, table.userId),
  ],
);

export const apiKey = pgTable("api_key", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  allowedDomains: text("allowed_domains").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export const website = pgTable("website", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  status: crawlStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const apiUsage = pgTable(
  "api_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    monthYear: text("month_year").notNull(), // e.g. "2023-10"
    apiCallCount: integer("api_call_count").notNull().default(0),
    limit: integer("limit").notNull().default(5000), // Configurable limit
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("org_month_unique").on(table.organizationId, table.monthYear),
  ],
);

export const documentChunk = pgTable(
  "document_chunk",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    websiteId: uuid("website_id")
      .notNull()
      .references(() => website.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 384 }), // For all-MiniLM-L6-v2
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);
