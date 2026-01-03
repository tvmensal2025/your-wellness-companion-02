-- Add composite unique constraint for food preferences so upsert works
ALTER TABLE public.user_food_preferences
ADD CONSTRAINT user_food_preferences_unique
UNIQUE (user_id, food_name, preference_type);
