-- Add unique constraint to quest_submissions to allow upsert
ALTER TABLE quest_submissions
ADD CONSTRAINT unique_user_quest UNIQUE (user_id, quest_id);
