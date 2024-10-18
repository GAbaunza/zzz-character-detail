import { client } from './client.ts';

export async function createTables() {
  await client.queryObject(`
     -- Table: avatars
    CREATE TABLE IF NOT EXISTS avatars (
      id INTEGER PRIMARY KEY,
      level INTEGER,
      name_mi18n TEXT,
      full_name_mi18n TEXT,
      element_type INTEGER,
      camp_name_mi18n TEXT,
      avatar_profession INTEGER,
      rarity TEXT,
      rank INTEGER
    );

    -- Table: avatar_weapons
    CREATE TABLE IF NOT EXISTS avatar_weapons (
      id INTEGER PRIMARY KEY,
      avatar_id INTEGER REFERENCES avatars(id),
      level INTEGER,
      name TEXT,
      star INTEGER,
      rarity TEXT,
      talent_title TEXT,
      talent_content TEXT,
      profession INTEGER
    );

    -- Table: disks
    CREATE TABLE IF NOT EXISTS disks (
      id INTEGER PRIMARY KEY,
      avatar_id INTEGER REFERENCES avatars(id),
      level INTEGER,
      name TEXT,
      rarity TEXT,
      disk_type INTEGER
    );

    -- Table: avatar_properties
    CREATE TABLE IF NOT EXISTS avatar_properties (
      id SERIAL PRIMARY KEY,
      avatar_id INTEGER REFERENCES avatars(id),
      property_name TEXT,
      property_id INTEGER,
      base TEXT,
      add TEXT,
      final TEXT
    );

    -- Table: avatar_skills
    CREATE TABLE IF NOT EXISTS avatar_skills (
      id SERIAL PRIMARY KEY,
      avatar_id INTEGER REFERENCES avatars(id),
      level INTEGER,
      skill_type INTEGER
    );

    -- Table: skill_details
    CREATE TABLE IF NOT EXISTS skill_details (
      id SERIAL PRIMARY KEY,
      skill_id INTEGER REFERENCES avatar_skills(id),
      title TEXT,
      text TEXT
    );

    -- Table: avatar_ranks
    CREATE TABLE IF NOT EXISTS avatar_ranks (
      id SERIAL PRIMARY KEY,
      avatar_id INTEGER REFERENCES avatars(id),
      rank_id INTEGER,
      name TEXT,
      description TEXT,
      pos INTEGER,
      is_unlocked BOOLEAN
    );

    -- Table: disk_properties
    CREATE TABLE IF NOT EXISTS disk_properties (
      id SERIAL PRIMARY KEY,
      disk_id INTEGER REFERENCES disks(id),
      property_name TEXT,
      property_id INTEGER,
      base TEXT
    );

    -- Table: disk_main_properties
    CREATE TABLE IF NOT EXISTS disk_main_properties (
      id SERIAL PRIMARY KEY,
      disk_id INTEGER REFERENCES disks(id),
      property_name TEXT,
      property_id INTEGER,
      base TEXT
    );
  `);
}