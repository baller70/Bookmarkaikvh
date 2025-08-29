-- Create Playbooks Database Schema
-- This migration creates tables for storing playbook data with full production features

-- 1. User Playbooks Table
CREATE TABLE IF NOT EXISTS public.user_playbooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Core playbook data
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    
    -- Visibility and collaboration
    is_public BOOLEAN DEFAULT FALSE,
    is_collaborative BOOLEAN DEFAULT FALSE,
    
    -- Marketplace integration
    is_marketplace_listed BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2) DEFAULT 0.00,
    category TEXT,
    
    -- Analytics
    plays INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_category CHECK (category IN ('Development', 'Design', 'AI/ML', 'Marketing', 'Business', 'Education', 'Other'))
);

-- 2. Playbook Bookmarks Table (junction table)
CREATE TABLE IF NOT EXISTS public.playbook_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
    bookmark_id UUID REFERENCES public.user_bookmarks(id) ON DELETE CASCADE NOT NULL,
    
    -- Playbook-specific metadata
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(playbook_id, bookmark_id),
    CONSTRAINT valid_duration CHECK (duration_minutes >= 0)
);

-- 3. Playbook Collaborators Table
CREATE TABLE IF NOT EXISTS public.playbook_collaborators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Collaboration permissions
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
    can_edit BOOLEAN DEFAULT FALSE,
    can_invite BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(playbook_id, user_id)
);

-- 4. Playbook Likes Table
CREATE TABLE IF NOT EXISTS public.playbook_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(playbook_id, user_id)
);

-- 5. Playbook Play History Table
CREATE TABLE IF NOT EXISTS public.playbook_plays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Play session data
    session_id UUID DEFAULT gen_random_uuid(),
    duration_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    bookmark_count INTEGER DEFAULT 0,
    
    -- Timestamps
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_duration_seconds CHECK (duration_seconds >= 0),
    CONSTRAINT valid_bookmark_count CHECK (bookmark_count >= 0)
);

-- 6. Playbook Marketplace Reviews Table
CREATE TABLE IF NOT EXISTS public.playbook_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Review data
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(playbook_id, user_id)
);

-- 7. Playbook Purchases Table (for marketplace)
CREATE TABLE IF NOT EXISTS public.playbook_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Purchase data
    price_paid DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'stripe',
    transaction_id TEXT,
    
    -- Timestamps
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_price_paid CHECK (price_paid >= 0),
    UNIQUE(playbook_id, buyer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_playbooks_user_id ON public.user_playbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_is_public ON public.user_playbooks(is_public);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_is_marketplace_listed ON public.user_playbooks(is_marketplace_listed);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_category ON public.user_playbooks(category);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_tags ON public.user_playbooks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_created_at ON public.user_playbooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_plays ON public.user_playbooks(plays DESC);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_likes ON public.user_playbooks(likes DESC);

CREATE INDEX IF NOT EXISTS idx_playbook_bookmarks_playbook_id ON public.playbook_bookmarks(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_bookmarks_bookmark_id ON public.playbook_bookmarks(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_playbook_bookmarks_order_index ON public.playbook_bookmarks(order_index);

CREATE INDEX IF NOT EXISTS idx_playbook_collaborators_playbook_id ON public.playbook_collaborators(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_collaborators_user_id ON public.playbook_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_playbook_likes_playbook_id ON public.playbook_likes(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_likes_user_id ON public.playbook_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_playbook_plays_playbook_id ON public.playbook_plays(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_plays_user_id ON public.playbook_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_playbook_plays_played_at ON public.playbook_plays(played_at DESC);

CREATE INDEX IF NOT EXISTS idx_playbook_reviews_playbook_id ON public.playbook_reviews(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_reviews_user_id ON public.playbook_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_playbook_reviews_rating ON public.playbook_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_playbook_purchases_playbook_id ON public.playbook_purchases(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_purchases_buyer_id ON public.playbook_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_playbook_purchases_seller_id ON public.playbook_purchases(seller_id);

-- Enable RLS
ALTER TABLE public.user_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_playbooks
CREATE POLICY "Users can view their own playbooks" ON public.user_playbooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public playbooks" ON public.user_playbooks
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view collaborative playbooks they have access to" ON public.user_playbooks
    FOR SELECT USING (
        is_collaborative = true AND 
        id IN (SELECT playbook_id FROM public.playbook_collaborators WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own playbooks" ON public.user_playbooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playbooks" ON public.user_playbooks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can update playbooks they have edit access to" ON public.user_playbooks
    FOR UPDATE USING (
        id IN (
            SELECT playbook_id FROM public.playbook_collaborators 
            WHERE user_id = auth.uid() AND can_edit = true
        )
    );

CREATE POLICY "Users can delete their own playbooks" ON public.user_playbooks
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for playbook_bookmarks
CREATE POLICY "Users can view bookmarks from their own playbooks" ON public.playbook_bookmarks
    FOR SELECT USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view bookmarks from public playbooks" ON public.playbook_bookmarks
    FOR SELECT USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE is_public = true)
    );

CREATE POLICY "Users can view bookmarks from collaborative playbooks they have access to" ON public.playbook_bookmarks
    FOR SELECT USING (
        playbook_id IN (
            SELECT playbook_id FROM public.playbook_collaborators WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert bookmarks to their own playbooks" ON public.playbook_bookmarks
    FOR INSERT WITH CHECK (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

CREATE POLICY "Collaborators can insert bookmarks to playbooks they have edit access to" ON public.playbook_bookmarks
    FOR INSERT WITH CHECK (
        playbook_id IN (
            SELECT playbook_id FROM public.playbook_collaborators 
            WHERE user_id = auth.uid() AND can_edit = true
        )
    );

CREATE POLICY "Users can update bookmarks in their own playbooks" ON public.playbook_bookmarks
    FOR UPDATE USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete bookmarks from their own playbooks" ON public.playbook_bookmarks
    FOR DELETE USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

-- Create RLS policies for playbook_collaborators
CREATE POLICY "Users can view collaborators of their own playbooks" ON public.playbook_collaborators
    FOR SELECT USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view their own collaboration records" ON public.playbook_collaborators
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert collaborators to their own playbooks" ON public.playbook_collaborators
    FOR INSERT WITH CHECK (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update collaborators in their own playbooks" ON public.playbook_collaborators
    FOR UPDATE USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete collaborators from their own playbooks" ON public.playbook_collaborators
    FOR DELETE USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

-- Create RLS policies for playbook_likes
CREATE POLICY "Users can view all likes" ON public.playbook_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.playbook_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.playbook_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for playbook_plays
CREATE POLICY "Users can view plays of their own playbooks" ON public.playbook_plays
    FOR SELECT USING (
        playbook_id IN (SELECT id FROM public.user_playbooks WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view their own play history" ON public.playbook_plays
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plays" ON public.playbook_plays
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for playbook_reviews
CREATE POLICY "Users can view all reviews" ON public.playbook_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON public.playbook_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.playbook_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.playbook_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for playbook_purchases
CREATE POLICY "Users can view their own purchases" ON public.playbook_purchases
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can view sales of their own playbooks" ON public.playbook_purchases
    FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert their own purchases" ON public.playbook_purchases
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create functions for updating counters
CREATE OR REPLACE FUNCTION update_playbook_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.user_playbooks 
        SET likes = likes + 1 
        WHERE id = NEW.playbook_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.user_playbooks 
        SET likes = likes - 1 
        WHERE id = OLD.playbook_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_playbook_plays_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_playbooks 
    SET plays = plays + 1 
    WHERE id = NEW.playbook_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_playbook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_playbook_likes_count_trigger
    AFTER INSERT OR DELETE ON public.playbook_likes
    FOR EACH ROW EXECUTE FUNCTION update_playbook_likes_count();

CREATE TRIGGER update_playbook_plays_count_trigger
    AFTER INSERT ON public.playbook_plays
    FOR EACH ROW EXECUTE FUNCTION update_playbook_plays_count();

CREATE TRIGGER update_user_playbooks_updated_at
    BEFORE UPDATE ON public.user_playbooks
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

CREATE TRIGGER update_playbook_bookmarks_updated_at
    BEFORE UPDATE ON public.playbook_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

CREATE TRIGGER update_playbook_collaborators_updated_at
    BEFORE UPDATE ON public.playbook_collaborators
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

CREATE TRIGGER update_playbook_reviews_updated_at
    BEFORE UPDATE ON public.playbook_reviews
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

-- Grant permissions
GRANT ALL ON public.user_playbooks TO authenticated;
GRANT ALL ON public.playbook_bookmarks TO authenticated;
GRANT ALL ON public.playbook_collaborators TO authenticated;
GRANT ALL ON public.playbook_likes TO authenticated;
GRANT ALL ON public.playbook_plays TO authenticated;
GRANT ALL ON public.playbook_reviews TO authenticated;
GRANT ALL ON public.playbook_purchases TO authenticated; 