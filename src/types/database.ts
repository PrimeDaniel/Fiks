export type UserRole = 'client' | 'pro';
export type JobCategory = 'Electricity' | 'Plumbing' | 'Assembly' | 'Moving' | 'Painting';
export type JobStatus = 'Open' | 'In Progress' | 'Completed';
export type BidStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface Profile {
    id: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    // Pro profile fields (optional)
    specializations?: JobCategory[];
    completed_jobs_count?: number;
    average_rating?: number;
    bio?: string;
}

export interface Job {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    title: string;
    description: string;
    category: JobCategory;
    photos: string[];
    price_offer: number;
    schedule_description?: string;
    allow_counter_offers: boolean;
    status: JobStatus;
    // Engagement fields
    views_count?: number;
    saves_count?: number;
    // Relations
    profile?: Profile;
    bids?: Bid[];
}

export interface Bid {
    id: string;
    created_at: string;
    updated_at: string;
    job_id: string;
    pro_id: string;
    price: number;
    status: BidStatus;
    message?: string;
    // Relations
    profile?: Profile;
    job?: Job;
}

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
            };
            jobs: {
                Row: Job;
                Insert: Omit<Job, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
            };
            bids: {
                Row: Bid;
                Insert: Omit<Bid, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Bid, 'id' | 'created_at' | 'updated_at' | 'job_id' | 'pro_id'>>;
            };
        };
    };
}
