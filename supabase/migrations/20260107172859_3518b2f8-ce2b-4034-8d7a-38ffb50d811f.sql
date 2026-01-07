-- Add privacy column for weight results visibility
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS show_weight_results boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.show_weight_results IS 'Controls whether other users can see weight loss/gain results';