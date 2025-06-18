-- PostgreSQL Schema for Persona SDK
-- This schema supports any PostgreSQL-compatible database (Supabase, Neon, etc.)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Personas table
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    occupation VARCHAR(255),
    sex VARCHAR(50),
    attributes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Persona groups table
CREATE TABLE IF NOT EXISTS persona_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS persona_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES persona_groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(persona_id, group_id)
);

-- Distributions table for storing generation parameters
CREATE TABLE IF NOT EXISTS distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'normal', 'uniform', 'exponential', etc.
    parameters JSONB NOT NULL, -- Distribution-specific parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generation history table for tracking bulk generations
CREATE TABLE IF NOT EXISTS generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES persona_groups(id) ON DELETE SET NULL,
    distribution_id UUID REFERENCES distributions(id) ON DELETE SET NULL,
    count INTEGER NOT NULL,
    parameters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_personas_name ON personas(name);
CREATE INDEX IF NOT EXISTS idx_personas_age ON personas(age);
CREATE INDEX IF NOT EXISTS idx_personas_occupation ON personas(occupation);
CREATE INDEX IF NOT EXISTS idx_personas_attributes ON personas USING GIN(attributes);
CREATE INDEX IF NOT EXISTS idx_persona_groups_name ON persona_groups(name);
CREATE INDEX IF NOT EXISTS idx_persona_group_members_persona ON persona_group_members(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_group_members_group ON persona_group_members(group_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_groups_updated_at BEFORE UPDATE ON persona_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW persona_group_stats AS
SELECT 
    pg.id,
    pg.name,
    pg.description,
    COUNT(pgm.persona_id) as member_count,
    AVG(p.age) as avg_age,
    pg.created_at,
    pg.updated_at
FROM persona_groups pg
LEFT JOIN persona_group_members pgm ON pg.id = pgm.group_id
LEFT JOIN personas p ON pgm.persona_id = p.id
GROUP BY pg.id, pg.name, pg.description, pg.created_at, pg.updated_at;

-- Function to get persona group with all members
CREATE OR REPLACE FUNCTION get_persona_group_with_members(group_id UUID)
RETURNS TABLE (
    group_id UUID,
    group_name VARCHAR(255),
    group_description TEXT,
    personas JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg.id,
        pg.name,
        pg.description,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', p.id,
                    'name', p.name,
                    'age', p.age,
                    'occupation', p.occupation,
                    'sex', p.sex,
                    'attributes', p.attributes,
                    'metadata', p.metadata
                ) ORDER BY p.name
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'::jsonb
        ) as personas
    FROM persona_groups pg
    LEFT JOIN persona_group_members pgm ON pg.id = pgm.group_id
    LEFT JOIN personas p ON pgm.persona_id = p.id
    WHERE pg.id = group_id
    GROUP BY pg.id, pg.name, pg.description;
END;
$$ LANGUAGE plpgsql;