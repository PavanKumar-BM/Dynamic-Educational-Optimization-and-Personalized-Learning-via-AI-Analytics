-- Migration: Add analytics tables for study sessions, chapter progress, and course progress

CREATE TABLE userStudySessions (
    sessionId SERIAL PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    courseRowId INTEGER NOT NULL,
    chapterRowId INTEGER NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER,
    duration INTEGER,
    sessionType VARCHAR(32),
    CONSTRAINT fk_course FOREIGN KEY(courseRowId) REFERENCES courseList(id),
    CONSTRAINT fk_chapter FOREIGN KEY(chapterRowId) REFERENCES courseChapters(id)
);

CREATE INDEX idx_userStudySessions_userId ON userStudySessions(userId);
CREATE INDEX idx_userStudySessions_courseRowId ON userStudySessions(courseRowId);
CREATE INDEX idx_userStudySessions_startTime ON userStudySessions(startTime);

CREATE TABLE chapterProgress (
    progressId SERIAL PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    courseRowId INTEGER NOT NULL,
    chapterRowId INTEGER NOT NULL,
    isCompleted BOOLEAN NOT NULL DEFAULT FALSE,
    timeSpent INTEGER,
    completionDate INTEGER,
    progressPercentage INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_course_chapter FOREIGN KEY(courseRowId) REFERENCES courseList(id),
    CONSTRAINT fk_chapter_chapter FOREIGN KEY(chapterRowId) REFERENCES courseChapters(id)
);

CREATE INDEX idx_chapterProgress_userId ON chapterProgress(userId);
CREATE INDEX idx_chapterProgress_courseRowId ON chapterProgress(courseRowId);
CREATE INDEX idx_chapterProgress_chapterRowId ON chapterProgress(chapterRowId);

CREATE TABLE courseProgress (
    progressId SERIAL PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    courseRowId INTEGER NOT NULL,
    totalTimeSpent INTEGER,
    completionPercentage INTEGER NOT NULL DEFAULT 0,
    chaptersCompleted INTEGER NOT NULL DEFAULT 0,
    lastAccessedDate INTEGER,
    isCompleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_course_progress FOREIGN KEY(courseRowId) REFERENCES courseList(id)
);

CREATE INDEX idx_courseProgress_userId ON courseProgress(userId);
CREATE INDEX idx_courseProgress_courseRowId ON courseProgress(courseRowId);
CREATE INDEX idx_courseProgress_lastAccessedDate ON courseProgress(lastAccessedDate);
