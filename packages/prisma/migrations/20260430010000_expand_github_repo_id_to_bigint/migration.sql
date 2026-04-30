-- GitHub repository IDs can exceed PostgreSQL's 32-bit INTEGER range.
ALTER TABLE "repo"
ALTER COLUMN "githubRepoId" TYPE BIGINT;
