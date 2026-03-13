-- /tmp/cumplia/supabase/migrations/0002_add_documents.sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id),
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- URL where the document is stored (e.g., S3)
    processing_status VARCHAR(50) DEFAULT 'queued', -- e.g., 'queued', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW())
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_subscription_id ON documents(subscription_id);
CREATE INDEX idx_documents_processing_status ON documents(processing_status);
