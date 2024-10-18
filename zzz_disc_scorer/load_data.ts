import { connectDB, disconnectDB } from './db/client.ts';
import { createTables } from './db/schema.ts';
import { loadJSON } from './utils/dataLoader.ts';
import { Avatar } from './models/avatar.ts';

async function main() {
  try {
    await connectDB();
    await createTables();

    const parsedData = await loadJSON('data.json');
    const avatarsData = parsedData.data.avatar_list;

    for (const avatarData of avatarsData) {
      // Map 'equip' to 'disks' in the avatar data
      if (avatarData.equip) {
        avatarData.disks = avatarData.equip;
        delete avatarData.equip;
      }

      const avatar = new Avatar(avatarData);
      await avatar.save();
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await disconnectDB();
  }
}

main();
