const generatedString = new Set<string>();

export function generateUniqueString(data: string): string {
  do {
    const timestamp = Date.now().toString().slice(-6); // 6 last number random of timestamp
    const randomNum = Math.floor(100000 + Math.random() * 900000).toString();; // 6 last number random
    data = `${data}` + `${timestamp}${randomNum}`.slice(0, 10);
  } while (generatedString.has(data)); // check exsits

  generatedString.add(data);
  return data;
}
