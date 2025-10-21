import { Blockquote } from "@mantine/core";
import { PRIMARY_COLOR } from "@/theme";

export default function SongLyrics({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Blockquote color={PRIMARY_COLOR} mt="xl">
      {children}
    </Blockquote>
  );
}
