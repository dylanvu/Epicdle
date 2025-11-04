export function createSnippetKey(date: Date): string {
  console.log("Creating snippet key for ", date);

  // !!! getMonth returns a zero-based index, so we need to add 1
  // yes this indeed did burn me for a nice few minutes...
  const month = date.getMonth() + 1;
  const newSnippetFileKey = `${date.getFullYear()}-${month}-${date.getDate()}.mp3`;
  return newSnippetFileKey;
}
