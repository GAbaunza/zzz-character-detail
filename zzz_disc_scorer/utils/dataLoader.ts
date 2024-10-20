export async function loadJSON(filePath: string) {
    const jsonData = await Deno.readTextFile(filePath);
    return JSON.parse(jsonData);
  }
  