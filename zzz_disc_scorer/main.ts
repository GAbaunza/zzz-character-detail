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
  equipment_type: number;
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
  const response = await fetch(
    `http://localhost:7000/basic?server=prod_gf_us&role_id=${id}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory for user with ID ${id}`);
  }

  const data: UserInventoryResponse = await response.json();
  return data.data.avatar_list; // Returning avatar_list directly
};

// Function to fetch additional info for each avatar
const fetchAvatarInfo = async (
  charaId: number,
  userId: string,
): Promise<AvatarInfoResponse> => {
  const url =
    `http://localhost:7000/info?id_list[]=${charaId}&need_wiki=true&server=prod_gf_us&role_id=${userId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch info for avatar ID ${charaId}`);
  }

  const avatarInfo: AvatarInfoResponse = await response.json();
  return avatarInfo;
};

const calculateEquipmentScore = (equip: Equip): number => {
  let score = 0;

  type StatName =
    | "ATK%"
    | "Flat ATK"
    | "CRIT Rate"
    | "CRIT DMG"
    | "DEF%"
    | "Flat DEF"
    | "HP%"
    | "Flat HP"
    | "PEN"
    | "Anomaly Proficiency";

  const baseValues: Record<StatName, number> = {
    "ATK%": 3,
    "Flat ATK": 10,
    "CRIT Rate": 2.4,
    "CRIT DMG": 4.8,
    "DEF%": 3,
    "Flat DEF": 15,
    "HP%": 3,
    "Flat HP": 112,
    "PEN": 9,
    "Anomaly Proficiency": 9,
  };

  const multipliers: Record<StatName, number> = {
    "ATK%": 1.8, // Higher value for ATK%
    "Flat ATK": 0.1, // Low value for Flat ATK
    "CRIT Rate": 3, // Even higher weight for CRIT Rate
    "CRIT DMG": 3, // Even higher weight for CRIT DMG
    "DEF%": 0.2, // Very low for DEF%
    "Flat DEF": 0.05, // Very low for Flat DEF
    "HP%": 0.1, // Low for HP%
    "Flat HP": 0.05, // Low for Flat HP
    "PEN": 0.5, // Medium for Pen
    "Anomaly Proficiency": 0.2, // Low weight
  };

  function parseBaseValue(base: string): number {
    return parseFloat(base.replace("%", ""));
  }

  function calculateLevelUps(stat: StatName, currentValue: number): number {
    const baseValue = baseValues[stat];
    if (currentValue > baseValue) {
      return Math.floor((currentValue - baseValue) / baseValue);
    }
    return 0;
  }

  equip.properties.forEach((prop: Property) => {
    const currentValue = parseBaseValue(prop.base);
    let statName: StatName | undefined = undefined;

    // Map property_id to the appropriate stat name
    if (prop.property_id == 12102) {
      statName = "ATK%";
    } else if (prop.property_id == 12103) {
      statName = "Flat ATK";
    } else if (prop.property_id == 20103) {
      statName = "CRIT Rate";
    } else if (prop.property_id == 21103) {
      statName = "CRIT DMG";
    } else if (prop.property_id == 13102) {
      statName = "DEF%";
    } else if (prop.property_id == 13103) {
      statName = "Flat DEF";
    } else if (prop.property_id == 11102) {
      statName = "HP%";
    }

    if (statName) {
      const levelUps = calculateLevelUps(statName, currentValue);
      const multiplier = multipliers[statName];

      score += (1 + levelUps) * currentValue * multiplier;
    }
  });

  function calculateMainStatScore(
    mainProperty: Property,
    equipmentType: number,
  ): number {
    const mainValue = parseBaseValue(mainProperty.base);
    let mainScore = 0;

    if (equipmentType === 4) {
      if (
        mainProperty.property_id === 11102 || mainProperty.property_id === 13102
      ) { // HP% or DEF%
        mainScore -= mainValue * 1.5; // Heavy penalty for HP% or DEF% as main stat
      }
    } else if (equipmentType === 5 || equipmentType === 6) {
      if (
        mainProperty.property_id === 11102 || mainProperty.property_id === 13102
      ) { // HP% or DEF%
        mainScore -= mainValue * 1.5; // Heavy penalty for HP% or DEF%
      }
    }

    return mainScore;
  }

  if (equip.equipment_type === 4) {
    equip.main_properties.forEach((mainProp: Property) => {
      score += calculateMainStatScore(mainProp, equip.equipment_type);
    });
  }

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
      ctx.response.body = { error: "Not found" };
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
