import {
  pgTable,
  serial,
  varchar,
  json,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const CourseList = pgTable("courseList", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  courseName: varchar("name").notNull(),
  category: varchar("category").notNull(),
  level: varchar("level").notNull(),
  courseOutput: json("courseOutput").notNull(),
  isVideo: varchar("isVideo").notNull().default("Yes"),
  username: varchar("username"),
  userprofileimage: varchar("userprofileimage"),
  createdBy: varchar("createdBy"),
  courseBanner: varchar("courseBanner"),
  isPublished: boolean("isPublished").notNull().default(false),
});

export const CourseChapters = pgTable("courseChapters", {
  id: serial("id").primaryKey(),
  courseId: varchar("courseId").notNull(),
  chapterId: integer("chapterId").notNull(),
  content: json("content").notNull(),
  videoId: varchar("videoId").notNull(),
});

// Analytics Tables
export const UserStudySessions = pgTable("userStudySessions", {
  sessionId: serial("sessionId").primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  courseRowId: integer("courseRowId").notNull(), // FK to courseList.id
  chapterRowId: integer("chapterRowId").notNull(), // FK to courseChapters.id
  startTime: integer("startTime").notNull(), // Unix timestamp seconds
  endTime: integer("endTime"), // Unix timestamp seconds
  duration: integer("duration"), // seconds
  sessionType: varchar("sessionType", { length: 32 }),
});

export const ChapterProgress = pgTable("chapterProgress", {
  progressId: serial("progressId").primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  courseRowId: integer("courseRowId").notNull(), // FK to courseList.id
  chapterRowId: integer("chapterRowId").notNull(), // FK to courseChapters.id
  isCompleted: boolean("isCompleted").notNull().default(false),
  timeSpent: integer("timeSpent"), // seconds
  completionDate: integer("completionDate"), // Unix timestamp seconds
  progressPercentage: integer("progressPercentage").notNull().default(0),
});

export const CourseProgress = pgTable("courseProgress", {
  progressId: serial("progressId").primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  courseRowId: integer("courseRowId").notNull(), // FK to courseList.id
  totalTimeSpent: integer("totalTimeSpent"), // seconds
  completionPercentage: integer("completionPercentage").notNull().default(0),
  chaptersCompleted: integer("chaptersCompleted").notNull().default(0),
  lastAccessedDate: integer("lastAccessedDate"), // Unix timestamp seconds
  isCompleted: boolean("isCompleted").notNull().default(false),
});
