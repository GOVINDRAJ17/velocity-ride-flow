-- Add ride ratings and reviews table
CREATE TABLE IF NOT EXISTS public.ride_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ride_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ride reviews
CREATE POLICY "Anyone can view reviews"
  ON public.ride_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for completed rides"
  ON public.ride_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM rides 
      WHERE id = ride_id AND status = 'completed'
    )
  );

CREATE POLICY "Users can update own reviews"
  ON public.ride_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Add completed status tracking
ALTER TABLE rides ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance
CREATE INDEX idx_ride_reviews_ride_id ON ride_reviews(ride_id);
CREATE INDEX idx_ride_reviews_reviewed_user ON ride_reviews(reviewed_user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ride_reviews_updated_at
  BEFORE UPDATE ON public.ride_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();