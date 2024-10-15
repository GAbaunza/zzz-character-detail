import { Application, Router } from "@oak/oak";

interface Property {
  base: string;
  property_name: string;
  property_id: number;
}

interface Equip {
  id: number;
  name: string;
  properties: Property[];
  main_properties: Property[];
  score?: number; // This will be calculated later
}

interface Avatar {
  id: number;
  name: string;
  equip: Equip[];
}

interface AvatarInfoResponse {
  data: {
    avatar_list: Avatar[];
  };
}

interface UserInventoryResponse {
  data: {
    avatar_list: Avatar[];
  };
}

// Mock function to fetch the user's inventory
const fetchUserInventory = async (id: string): Promise<Avatar[]> => {
  const response = await fetch(`http://localhost:7000/basic?server=prod_gf_us&role_id=${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory for user with ID ${id}`);
  }

  const data: UserInventoryResponse = await response.json();
  return data.data.avatar_list; // Returning avatar_list directly
};

// Function to fetch additional info for each avatar
const fetchAvatarInfo = async (charaId: number, userId: string): Promise<AvatarInfoResponse> => {
  const url = `http://localhost:7000/info?id_list[]=${charaId}&need_wiki=true&server=prod_gf_us&role_id=${userId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch info for avatar ID ${charaId}`);
  }

  const avatarInfo: AvatarInfoResponse = await response.json();
  return avatarInfo;
};

// Placeholder function for calculating the "score" of equipment based on properties
const calculateEquipmentScore = (equip: Equip): number => {
  let score = 0;

  // Example: Sum up some "base" property values for score
  equip.properties.forEach((prop: Property) => {
    if (prop.property_id == 13102) { // DEF%
      score += 0;
    }
    else if (prop.property_id == 13103) { // DEF
      score += 0;
    }
    else if (prop.property_id == 11102) { // HP%
      score += 0;
    }
    else if (prop.property_id == 11103) { // HP
      score += 0;
    }
    else if (prop.property_id == 12102) { // ATK%
      score += 0;
    }
    else if (prop.property_id == 12103) { // ATK
      score += 0;
    }
    else if (prop.property_id == 20103) { // CRIT Rate
      score += 0;
    }
    else if (prop.property_id == 21103) { // CRIT DMG
      score += 0;
    }
    else if (prop.property_id == 23203) { // PEN
      score += 0;
    }
    else if (prop.property_id == 31203) { // Anomaly Proficiency
      score += 0;
    }
  });

  equip.main_properties.forEach((prop: Property) => {
    score += parseFloat(prop.base) || 0;
  });

  return score;
};

const router = new Router();

router.get("/user/:id", async (ctx) => {
  const userId = ctx.params.id;

  if (userId) {
    try {
      const avatarList = await fetchUserInventory(userId);

      const avatarInfoPromises = avatarList.map(async (avatar: Avatar) => {
        const avatarInfo = await fetchAvatarInfo(avatar.id, userId);

        avatarInfo.data.avatar_list.forEach((avatar: Avatar) => {
          avatar.equip.forEach((equip: Equip) => {
            equip.score = calculateEquipmentScore(equip);
          });
        });

        return avatarInfo;
      });

      const avatarInfoList = await Promise.all(avatarInfoPromises);

      ctx.response.status = 200;
      ctx.response.body = avatarInfoList;
    } catch (_error) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Not found' };
    }
  } else {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid user ID" };
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
