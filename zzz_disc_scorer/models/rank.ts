import { client } from '../db/client.ts';

interface RankData {
  id: number;
  name: string;
  description: string;  // Changed from 'desc' to 'description'
  pos: number;
  is_unlocked: boolean;
}

export class Rank {
  data: RankData;
  avatar_id: number;

  constructor(data: RankData, avatar_id: number) {
    this.data = data;
    this.avatar_id = avatar_id;
  }

  async save() {
    await client.queryObject(`
      INSERT INTO avatar_ranks (
        avatar_id, rank_id, name, description, pos, is_unlocked
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
    `, [
      this.avatar_id,
      this.data.id,
      this.data.name,
      this.data.description,  // Use 'description' here
      this.data.pos,
      this.data.is_unlocked,
    ]);
  }
}
