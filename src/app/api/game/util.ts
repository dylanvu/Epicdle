import { getYearMonthDay } from "@/util/time";
export function createSnippetKey(date: Date): string {
  console.log("Creating snippet key for ", date);
  const dateString = getYearMonthDay(date);
  const newSnippetFileKey = `${dateString}.mp3`;
  return newSnippetFileKey;
}
