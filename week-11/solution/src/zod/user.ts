-- Create User Table
CREATE TABLE "Users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" TEXT NOT NULL
);

-- Create Posts Table
CREATE TABLE "Posts" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create Tags Table
CREATE TABLE "Tags" (
    "id" SERIAL PRIMARY KEY,
    "tag" VARCHAR(255) NOT NULL UNIQUE
);

-- Create PostTags Join Table
CREATE TABLE "PostTags" (
    "post_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    PRIMARY KEY ("post_id", "tag_id"),

    CONSTRAINT "PostTags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Posts"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "idx_Posts_user_id" ON "Posts"("user_id");
CREATE INDEX "idx_PostTags_tag_id" ON "PostTags"("tag_id");

-- Optional: Add more indexes if necessary depending on the queries you'll run most often.
