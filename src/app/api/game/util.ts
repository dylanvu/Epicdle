import { getDailyKey } from "@/util/time";
export function createSnippetKey(date: Date): string {
  console.log("Creating snippet key for ", date);
  const dateString = getDailyKey(date);
  const newSnippetFileKey = `${dateString}.mp3`;
  return newSnippetFileKey;
}
