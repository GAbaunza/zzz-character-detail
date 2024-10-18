import { client } from '../db/client.ts';

interface DiskPropertyData {
  property_name: string;
  property_id: number;
  base: string;
}

interface DiskData {
  id: number;
  level: number;
  name: string;
  rarity: string;
  disk_type: number;
  properties?: DiskPropertyData[];
  main_properties?: DiskPropertyData[];
}

export class Disk {
  data: DiskData;
  avatar_id: number;
  properties: DiskPropertyData[] = [];
  main_properties: DiskPropertyData[] = [];

  constructor(data: DiskData, avatar_id: number) {
    this.data = data;
    this.avatar_id = avatar_id;

    // Initialize properties
    if (data.properties) {
      this.properties = data.properties;
    }

    // Initialize main_properties
    if (data.main_properties) {
      this.main_properties = data.main_properties;
    }
  }

  async save() {
    // Insert or update disk data
    await client.queryObject(`
      INSERT INTO disks (
        id, avatar_id, level, name, rarity, disk_type
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) ON CONFLICT (id) DO UPDATE SET
        avatar_id = EXCLUDED.avatar_id,
        level = EXCLUDED.level,
        name = EXCLUDED.name,
        rarity = EXCLUDED.rarity,
        disk_type = EXCLUDED.disk_type
    `, [
      this.data.id,
      this.avatar_id,
      this.data.level,
      this.data.name,
      this.data.rarity,
      this.data.disk_type,
    ]);

    // Clean up existing properties to prevent duplicates
    await client.queryObject(`DELETE FROM disk_properties WHERE disk_id = $1`, [this.data.id]);
    await client.queryObject(`DELETE FROM disk_main_properties WHERE disk_id = $1`, [this.data.id]);

    // Save properties
    for (const property of this.properties) {
      await client.queryObject(`
        INSERT INTO disk_properties (
          disk_id, property_name, property_id, base
        ) VALUES (
          $1, $2, $3, $4
        )
      `, [
        this.data.id,
        property.property_name,
        property.property_id,
        property.base,
      ]);
    }

    // Save main_properties
    for (const mainProperty of this.main_properties) {
      await client.queryObject(`
        INSERT INTO disk_main_properties (
          disk_id, property_name, property_id, base
        ) VALUES (
          $1, $2, $3, $4
        )
      `, [
        this.data.id,
        mainProperty.property_name,
        mainProperty.property_id,
        mainProperty.base,
      ]);
    }
  }
}
