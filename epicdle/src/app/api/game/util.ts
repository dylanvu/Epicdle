export function getTodaysDate() {
  // create a fixed date for testing
  const today = new Date(2025, 8, 8);
  return today;
}

export function createSnippetKey(date: Date): string {
  const newSnippetFileKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.mp3`;
  return newSnippetFileKey;
}
