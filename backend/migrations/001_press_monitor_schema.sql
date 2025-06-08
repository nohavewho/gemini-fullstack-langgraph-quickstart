-- Press Monitor Schema Migration
-- Creates tables for Azerbaijan press monitoring system

-- Table for storing press articles
CREATE TABLE IF NOT EXISTS press_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_country TEXT,
    source_language VARCHAR(10) NOT NULL,
    language_name TEXT NOT NULL,
    region TEXT,
    published_date TIMESTAMP WITH TIME ZONE,
    fetched_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_content TEXT,
    translated_content TEXT,
    summary TEXT,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score FLOAT,
    sentiment_explanation TEXT,
    key_phrases JSONB,
    mentions_context JSONB,
    thread_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for press digests
CREATE TABLE IF NOT EXISTS press_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    digest_type VARCHAR(20) CHECK (digest_type IN ('positive', 'negative', 'daily', 'weekly')),
    content TEXT NOT NULL,
    articles_count INTEGER,
    languages_covered JSONB,
    countries_covered JSONB,
    regions_breakdown JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_email BOOLEAN DEFAULT FALSE,
    sent_telegram BOOLEAN DEFAULT FALSE
);

-- Mapping table for articles to digests
CREATE TABLE IF NOT EXISTS article_digest_mapping (
    article_id UUID REFERENCES press_articles(id),
    digest_id UUID REFERENCES press_digests(id),
    PRIMARY KEY (article_id, digest_id)
);

-- Language coverage tracking
CREATE TABLE IF NOT EXISTS language_coverage (
    language_code VARCHAR(10) PRIMARY KEY,
    language_name TEXT NOT NULL,
    native_name TEXT,
    region TEXT,
    countries TEXT[],
    last_checked TIMESTAMP WITH TIME ZONE,
    articles_found INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_articles_sentiment ON press_articles(sentiment);
CREATE INDEX idx_articles_published ON press_articles(published_date DESC);
CREATE INDEX idx_articles_language ON press_articles(source_language);
CREATE INDEX idx_articles_country ON press_articles(source_country);
CREATE INDEX idx_articles_url ON press_articles(url);
CREATE INDEX idx_language_coverage_checked ON language_coverage(last_checked);

-- Insert initial language data
INSERT INTO language_coverage (language_code, language_name, native_name, region, countries) VALUES
-- Priority: Neighbors
('tr', 'Turkish', 'Türkçe', 'Asia/Europe', ARRAY['TR']),
('ru', 'Russian', 'Русский', 'Europe/Asia', ARRAY['RU', 'BY', 'KZ']),
('fa', 'Persian', 'فارسی', 'Middle East', ARRAY['IR', 'AF']),
('ka', 'Georgian', 'ქართული', 'Asia', ARRAY['GE']),
('hy', 'Armenian', 'Հայերեն', 'Asia', ARRAY['AM']),
('az', 'Azerbaijani', 'Azərbaycan', 'Asia', ARRAY['AZ']),

-- Central Asia
('kk', 'Kazakh', 'Қазақ', 'Asia', ARRAY['KZ']),
('uz', 'Uzbek', 'Oʻzbek', 'Asia', ARRAY['UZ']),
('tk', 'Turkmen', 'Türkmen', 'Asia', ARRAY['TM']),
('ky', 'Kyrgyz', 'Кыргызча', 'Asia', ARRAY['KG']),
('tg', 'Tajik', 'Тоҷикӣ', 'Asia', ARRAY['TJ']),

-- Southeast Asia
('th', 'Thai', 'ไทย', 'Asia', ARRAY['TH']),
('id', 'Indonesian', 'Bahasa Indonesia', 'Asia', ARRAY['ID']),
('ms', 'Malay', 'Bahasa Melayu', 'Asia', ARRAY['MY', 'SG']),
('tl', 'Filipino', 'Tagalog', 'Asia', ARRAY['PH']),
('vi', 'Vietnamese', 'Tiếng Việt', 'Asia', ARRAY['VN']),

-- East Asia
('zh', 'Chinese', '中文', 'Asia', ARRAY['CN', 'TW', 'SG']),
('ja', 'Japanese', '日本語', 'Asia', ARRAY['JP']),
('ko', 'Korean', '한국어', 'Asia', ARRAY['KR', 'KP']),
('mn', 'Mongolian', 'Монгол', 'Asia', ARRAY['MN']),

-- South Asia
('hi', 'Hindi', 'हिन्दी', 'Asia', ARRAY['IN']),
('ur', 'Urdu', 'اردو', 'Asia', ARRAY['PK', 'IN']),
('bn', 'Bengali', 'বাংলা', 'Asia', ARRAY['BD', 'IN']),
('ne', 'Nepali', 'नेपाली', 'Asia', ARRAY['NP']),
('si', 'Sinhala', 'සිංහල', 'Asia', ARRAY['LK']),

-- Middle East
('ar', 'Arabic', 'العربية', 'Middle East', ARRAY['SA', 'EG', 'AE', 'IQ', 'SY', 'JO', 'LB', 'KW', 'QA']),
('he', 'Hebrew', 'עברית', 'Middle East', ARRAY['IL']),

-- Europe
('en', 'English', 'English', 'Global', ARRAY['US', 'UK', 'AU', 'CA', 'NZ']),
('de', 'German', 'Deutsch', 'Europe', ARRAY['DE', 'AT', 'CH']),
('fr', 'French', 'Français', 'Global', ARRAY['FR', 'CA', 'BE', 'CH']),
('es', 'Spanish', 'Español', 'Global', ARRAY['ES', 'MX', 'AR', 'CO', 'PE', 'CL']),
('pt', 'Portuguese', 'Português', 'Global', ARRAY['BR', 'PT', 'AO', 'MZ']),
('it', 'Italian', 'Italiano', 'Europe', ARRAY['IT', 'CH']),
('pl', 'Polish', 'Polski', 'Europe', ARRAY['PL']),
('uk', 'Ukrainian', 'Українська', 'Europe', ARRAY['UA']),
('nl', 'Dutch', 'Nederlands', 'Europe', ARRAY['NL', 'BE']),
('sv', 'Swedish', 'Svenska', 'Europe', ARRAY['SE']),
('no', 'Norwegian', 'Norsk', 'Europe', ARRAY['NO']),
('da', 'Danish', 'Dansk', 'Europe', ARRAY['DK']),
('fi', 'Finnish', 'Suomi', 'Europe', ARRAY['FI']),
('is', 'Icelandic', 'Íslenska', 'Europe', ARRAY['IS']),
('el', 'Greek', 'Ελληνικά', 'Europe', ARRAY['GR', 'CY']),
('ro', 'Romanian', 'Română', 'Europe', ARRAY['RO', 'MD']),
('bg', 'Bulgarian', 'Български', 'Europe', ARRAY['BG']),
('hr', 'Croatian', 'Hrvatski', 'Europe', ARRAY['HR']),
('sr', 'Serbian', 'Српски', 'Europe', ARRAY['RS']),
('cs', 'Czech', 'Čeština', 'Europe', ARRAY['CZ']),
('sk', 'Slovak', 'Slovenčina', 'Europe', ARRAY['SK']),
('sl', 'Slovenian', 'Slovenščina', 'Europe', ARRAY['SI']),
('hu', 'Hungarian', 'Magyar', 'Europe', ARRAY['HU']),
('et', 'Estonian', 'Eesti', 'Europe', ARRAY['EE']),
('lv', 'Latvian', 'Latviešu', 'Europe', ARRAY['LV']),
('lt', 'Lithuanian', 'Lietuvių', 'Europe', ARRAY['LT']),

-- Africa
('sw', 'Swahili', 'Kiswahili', 'Africa', ARRAY['KE', 'TZ', 'UG']),
('am', 'Amharic', 'አማርኛ', 'Africa', ARRAY['ET']),
('yo', 'Yoruba', 'Yorùbá', 'Africa', ARRAY['NG']),
('zu', 'Zulu', 'isiZulu', 'Africa', ARRAY['ZA']),
('xh', 'Xhosa', 'isiXhosa', 'Africa', ARRAY['ZA']),
('af', 'Afrikaans', 'Afrikaans', 'Africa', ARRAY['ZA', 'NA']),

-- Americas
('qu', 'Quechua', 'Runa Simi', 'South America', ARRAY['PE', 'BO', 'EC']),
('gn', 'Guarani', 'Avañeẽ', 'South America', ARRAY['PY']),
('ay', 'Aymara', 'Aymar aru', 'South America', ARRAY['BO', 'PE']),
('ht', 'Haitian Creole', 'Kreyòl ayisyen', 'Caribbean', ARRAY['HT'])
ON CONFLICT (language_code) DO NOTHING;