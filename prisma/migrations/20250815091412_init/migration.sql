-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT,
    "techLevel" TEXT NOT NULL DEFAULT 'A',
    "bizLevel" TEXT NOT NULL DEFAULT 'a',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "checklist_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checklist_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "checklist_results_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "checklist_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "test_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "options" TEXT,
    "correctAnswer" TEXT,
    "maxScore" INTEGER NOT NULL DEFAULT 30,
    "timeLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "test_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "test_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "test_questions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "progress_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "techLevel" TEXT NOT NULL,
    "bizLevel" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "improvement" TEXT,
    "recordDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "progress_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_results_userId_itemId_key" ON "checklist_results"("userId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "test_answers_userId_questionId_key" ON "test_answers"("userId", "questionId");
