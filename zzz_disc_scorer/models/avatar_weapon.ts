import { client } from '../db/client.ts';

interface WeaponData {
  id: number;
  level: number;
  name: string;
  star: number;
  rarity: string;
  talent_title: string;
  talent_content: string;
  profession: number;
}

export class Weapon {
  data: WeaponData;
  avatar_id: number;

  constructor(data: any, avatar_id: number) {
    this.data = {
      id: data.id,
      level: data.level,
      name: data.name,
      star: data.star,
      rarity: data.rarity,
      talent_title: data.talent_title,
      talent_content: data.talent_content,
      profession: data.profession,
    };
    this.avatar_id = avatar_id;
  }

  async save() {
    await client.queryObject(`
      INSERT INTO avatar_weapons (
        id, avatar_id, level, name, star, rarity, talent_title,
        talent_content, profession
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) ON CONFLICT (id) DO UPDATE SET
        avatar_id = EXCLUDED.avatar_id,
        level = EXCLUDED.level,
        name = EXCLUDED.name,
        star = EXCLUDED.star,
        rarity = EXCLUDED.rarity,
        talent_title = EXCLUDED.talent_title,
        talent_content = EXCLUDED.talent_content,
        profession = EXCLUDED.profession
    `, [
      this.data.id,
      this.avatar_id,
      this.data.level,
      this.data.name,
      this.data.star,
      this.data.rarity,
      this.data.talent_title,
      this.data.talent_content,
      this.data.profession,
    ]);
  }
}
