import { sqliteTable,text,integer,index,uniqueIndex } from 'drizzle-orm/sqlite-core';
export const events=sqliteTable('events',{id:text('id').primaryKey(),owner:text('owner').notNull(),revision:integer('revision').notNull().default(0),document:text('document').notNull(),updatedAt:text('updated_at').notNull()},t=>[index('events_owner_idx').on(t.owner)]);
export const audit=sqliteTable('audit',{id:text('id').primaryKey(),eventId:text('event_id').notNull().references(()=>events.id),owner:text('owner').notNull(),revision:integer('revision').notNull(),action:text('action').notNull(),detail:text('detail').notNull(),actor:text('actor').notNull(),at:text('at').notNull()},t=>[index('audit_event_idx').on(t.eventId)]);

export const revisions=sqliteTable('revisions',{id:text('id').primaryKey(),eventId:text('event_id').notNull().references(()=>events.id),owner:text('owner').notNull(),revision:integer('revision').notNull(),document:text('document').notNull(),at:text('at').notNull()},t=>[uniqueIndex('revisions_event_revision_idx').on(t.eventId,t.revision)]);

export const operations = sqliteTable("operations",{id:text("id").primaryKey(),owner:text("owner").notNull(),result:text("result").notNull(),at:text("at").notNull()});
