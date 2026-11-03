-- Add a per-user token version for durable JWT revocation.
ALTER TABLE "users"
ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0;
