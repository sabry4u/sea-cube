-- Create teams table
CREATE TABLE IF NOT EXISTS archaeology_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name TEXT NOT NULL,
  location TEXT NOT NULL,
  object_type TEXT NOT NULL,
  project_name TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location, object_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_location_object ON archaeology_teams(location, object_type);

-- Mediterranean Teams
INSERT INTO archaeology_teams (team_name, location, object_type, project_name, description) VALUES
  ('Mediterranean Diggers', 'mediterranean', 'amphora', 'Ancient Trade Routes', 'Specializing in Greek and Roman pottery vessels'),
  ('Mediterranean Diggers', 'mediterranean', 'pottery', 'Ancient Trade Routes', 'Ceramic analysis and dating'),
  ('Mediterranean Diggers', 'mediterranean', 'statue', 'Ancient Trade Routes', 'Bronze and marble sculptures'),
  ('Hellenic Heritage', 'mediterranean', 'anchor', 'Ancient Shipwrecks', 'Greek and Roman anchor recovery'),
  ('Hellenic Heritage', 'mediterranean', 'coin', 'Ancient Shipwrecks', 'Numismatic analysis'),
  ('Roman Wreck Recovery', 'mediterranean', 'ship', 'Merchant Vessels', 'Roman ship reconstruction'),
  ('Roman Wreck Recovery', 'mediterranean', 'cargo', 'Merchant Vessels', 'Trade goods analysis');

-- Caribbean Teams
INSERT INTO archaeology_teams (team_name, location, object_type, project_name, description) VALUES
  ('Caribbean Pirates Ahoy', 'caribbean', 'anchor', 'Pirate Ship Recovery', '17th century pirate vessel excavation'),
  ('Caribbean Pirates Ahoy', 'caribbean', 'cannon', 'Pirate Ship Recovery', 'Naval artillery preservation'),
  ('Caribbean Pirates Ahoy', 'caribbean', 'chest', 'Pirate Ship Recovery', 'Treasure and cargo documentation'),
  ('Colonial Trade Institute', 'caribbean', 'pottery', 'Colonial Settlements', 'European colonial ceramics'),
  ('Colonial Trade Institute', 'caribbean', 'tool', 'Colonial Settlements', 'Maritime trade tools'),
  ('Galleon Hunters', 'caribbean', 'ship', 'Spanish Treasure Fleet', 'Spanish galleon excavation'),
  ('Galleon Hunters', 'caribbean', 'coin', 'Spanish Treasure Fleet', 'Spanish colonial currency');

-- Pacific Teams
INSERT INTO archaeology_teams (team_name, location, object_type, project_name, description) VALUES
  ('Pacific Explorers', 'pacific', 'pottery', 'Polynesian Artifacts', 'Traditional Polynesian ceramics'),
  ('Pacific Explorers', 'pacific', 'tool', 'Polynesian Artifacts', 'Navigation and fishing implements'),
  ('Pacific Explorers', 'pacific', 'statue', 'Polynesian Artifacts', 'Stone carvings and tikis'),
  ('WWII Heritage', 'pacific', 'ship', 'Naval Archaeology', 'WWII shipwreck documentation'),
  ('WWII Heritage', 'pacific', 'aircraft', 'Naval Archaeology', 'Underwater aircraft recovery'),
  ('Asian Maritime', 'pacific', 'anchor', 'Ancient Asian Trade', 'Chinese and Japanese maritime trade');

-- Create upload logs table (audit trail)
CREATE TABLE IF NOT EXISTS upload_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT,
  confidence_threshold INTEGER,
  object_detected TEXT,
  object_confidence REAL,
  team_matched TEXT,
  error_type TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_at ON upload_logs(uploaded_at DESC);