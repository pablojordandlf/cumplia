-- /tmp/cumplia/database/migrations/001_add_subscriptions.sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_type VARCHAR(255) NOT NULL, -- e.g., 'free', 'pro', 'agency'
    status VARCHAR(50) NOT NULL, -- e.g., 'active', 'canceled', 'past_due'
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC', NOW())
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
