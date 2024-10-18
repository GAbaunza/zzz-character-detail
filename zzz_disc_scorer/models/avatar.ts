import { client } from '../db/client.ts';
import { Weapon } from './avatar_weapon.ts';
import { Disk  } from './disk.ts';
import { Property } from './property.ts';
import { Skill } from './skill.ts';
import { Rank } from './rank.ts';

interface AvatarData {
  id: number;
  level: number;
  name_mi18n: string;
  full_name_mi18n: string;
  element_type: number;
  camp_name_mi18n: string;
  avatar_profession: number;
  rarity: string;
  rank: number;
  weapon?: any;
  disks?: any[];
  properties?: any[];
  skills?: any[];
  ranks?: any[];
}

export class Avatar {
  data: AvatarData;
  weapon?: Weapon;
  disks: Disk[] = [];
  properties: Property[] = [];
  skills: Skill[] = [];
  ranks: Rank[] = [];

  constructor(data: AvatarData) {
    this.data = data;

    // Initialize weapon
    if (data.weapon) {
      this.weapon = new Weapon(data.weapon, data.id);
    }

    // Initialize disks
    if (data.disks) {
      this.disks = data.disks.map(
        (diskData) => new Disk(diskData, data.id)
      );
    }

    // Initialize properties
    if (data.properties) {
      this.properties = data.properties.map(
        (propData) => new Property(propData, data.id)
      );
    }

    // Initialize skills
    if (data.skills) {
      this.skills = data.skills.map(
        (skillData) => new Skill(skillData, data.id)
      );
    }

     // Initialize ranks
     if (data.ranks) {
      this.ranks = data.ranks.map(
        (rankData) =>
          new Rank(
            {
              id: rankData.id,
              name: rankData.name,
              description: rankData.desc,  // Map 'desc' to 'description'
              pos: rankData.pos,
              is_unlocked: rankData.is_unlocked,
            },
            data.id
          )
      );
    }
  }

  async save() {
    // Insert or update avatar data
    await client.queryObject(`
      INSERT INTO avatars (
        id, level, name_mi18n, full_name_mi18n, element_type, camp_name_mi18n,
        avatar_profession, rarity, rank
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9
      ) ON CONFLICT (id) DO UPDATE SET
        level = EXCLUDED.level,
        name_mi18n = EXCLUDED.name_mi18n,
        full_name_mi18n = EXCLUDED.full_name_mi18n,
        element_type = EXCLUDED.element_type,
        camp_name_mi18n = EXCLUDED.camp_name_mi18n,
        avatar_profession = EXCLUDED.avatar_profession,
        rarity = EXCLUDED.rarity,
        rank = EXCLUDED.rank
    `, [
      this.data.id,
      this.data.level,
      this.data.name_mi18n,
      this.data.full_name_mi18n,
      this.data.element_type,
      this.data.camp_name_mi18n,
      this.data.avatar_profession,
      this.data.rarity,
      this.data.rank,
    ]);

    // Save weapon
    if (this.weapon) {
      await this.weapon.save();
    }

    // Save disks
    for (const disk of this.disks) {
      await disk.save();
    }

    // Save properties
    for (const property of this.properties) {
      await property.save();
    }

    // Save skills
    for (const skill of this.skills) {
      await skill.save();
    }

    // Save ranks
    for (const rank of this.ranks) {
      await rank.save();
    }
  }
}
