import { client } from '../db/client.ts';

interface SkillItemData {
  title: string;
  text: string;
}

interface SkillData {
  level: number;
  skill_type: number;
  items: SkillItemData[];
}

export class Skill {
  data: SkillData;
  avatar_id: number;
  id?: number; // Will be assigned after saving

  constructor(data: SkillData, avatar_id: number) {
    this.data = data;
    this.avatar_id = avatar_id;
  }

  async save() {
    const result = await client.queryObject<{ id: number }>(`
      INSERT INTO avatar_skills (
        avatar_id, level, skill_type
      ) VALUES (
        $1, $2, $3
      ) RETURNING id
    `, [
      this.avatar_id,
      this.data.level,
      this.data.skill_type,
    ]);

    this.id = result.rows[0].id;

    // Save skill items
    for (const item of this.data.items) {
      await client.queryObject(`
        INSERT INTO skill_details (
          skill_id, title, text
        ) VALUES (
          $1, $2, $3
        )
      `, [
        this.id,
        item.title,
        item.text,
      ]);
    }
  }
}
