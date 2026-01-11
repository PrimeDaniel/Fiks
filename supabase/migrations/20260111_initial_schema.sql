-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'pro');
CREATE TYPE job_category AS ENUM ('Electricity', 'Plumbing', 'Assembly', 'Moving', 'Painting');
CREATE TYPE job_status AS ENUM ('Open', 'In Progress', 'Completed');
CREATE TYPE bid_status AS ENUM ('Pending', 'Accepted', 'Rejected');

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category job_category NOT NULL,
    photos TEXT[] DEFAULT '{}',
    price_offer DECIMAL(10, 2) NOT NULL,
    schedule_description TEXT,
    allow_counter_offers BOOLEAN DEFAULT TRUE,
    status job_status DEFAULT 'Open' NOT NULL
);

-- Create bids table
CREATE TABLE bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    pro_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status bid_status DEFAULT 'Pending' NOT NULL,
    message TEXT,
    UNIQUE(job_id, pro_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_bids_job_id ON bids(job_id);
CREATE INDEX idx_bids_pro_id ON bids(pro_id);
CREATE INDEX idx_bids_status ON bids(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone"
    ON jobs FOR SELECT
    USING (true);

CREATE POLICY "Clients can create jobs"
    ON jobs FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
    );

CREATE POLICY "Job owners can update their jobs"
    ON jobs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Job owners can delete their jobs"
    ON jobs FOR DELETE
    USING (auth.uid() = user_id);

-- Bids policies
CREATE POLICY "Bids are viewable by job owner and bid creator"
    ON bids FOR SELECT
    USING (
        auth.uid() = pro_id OR
        auth.uid() IN (SELECT user_id FROM jobs WHERE id = bids.job_id)
    );

CREATE POLICY "Pros can create bids"
    ON bids FOR INSERT
    WITH CHECK (
        auth.uid() = pro_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pro')
    );

CREATE POLICY "Pros can update their own bids"
    ON bids FOR UPDATE
    USING (auth.uid() = pro_id);

CREATE POLICY "Job owners can update bid status"
    ON bids FOR UPDATE
    USING (
        auth.uid() IN (SELECT user_id FROM jobs WHERE id = bids.job_id)
    );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
