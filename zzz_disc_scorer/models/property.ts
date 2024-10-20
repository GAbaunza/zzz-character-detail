import { client } from '../db/client.ts';

interface PropertyData {
  property_name: string;
  property_id: number;
  base: string;
  add?: string;
  final?: string;
}

export class Property {
  data: PropertyData;
  avatar_id: number;

  constructor(data: PropertyData, avatar_id: number) {
    this.data = data;
    this.avatar_id = avatar_id;
  }

  async save() {
    await client.queryObject(`
      INSERT INTO avatar_properties (
        avatar_id, property_name, property_id, base, add, final
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
    `, [
      this.avatar_id,
      this.data.property_name,
      this.data.property_id,
      this.data.base,
      this.data.add || null,
      this.data.final || null,
    ]);
  }
}
