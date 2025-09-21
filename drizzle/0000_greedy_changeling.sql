CREATE TABLE IF NOT EXISTS "chapterProgress" (
	"progressId" serial PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"courseRowId" integer NOT NULL,
	"chapterRowId" integer NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"timeSpent" integer,
	"completionDate" integer,
	"progressPercentage" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courseChapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"chapterId" integer NOT NULL,
	"content" json NOT NULL,
	"videoId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courseList" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"level" varchar NOT NULL,
	"courseOutput" json NOT NULL,
	"isVideo" varchar DEFAULT 'Yes' NOT NULL,
	"username" varchar,
	"userprofileimage" varchar,
	"createdBy" varchar,
	"courseBanner" varchar,
	"isPublished" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courseProgress" (
	"progressId" serial PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"courseRowId" integer NOT NULL,
	"totalTimeSpent" integer,
	"completionPercentage" integer DEFAULT 0 NOT NULL,
	"chaptersCompleted" integer DEFAULT 0 NOT NULL,
	"lastAccessedDate" integer,
	"isCompleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userStudySessions" (
	"sessionId" serial PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"courseRowId" integer NOT NULL,
	"chapterRowId" integer NOT NULL,
	"startTime" integer NOT NULL,
	"endTime" integer,
	"duration" integer,
	"sessionType" varchar(32)
);
