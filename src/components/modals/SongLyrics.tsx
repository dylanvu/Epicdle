import { Blockquote } from "@mantine/core";
import { PRIMARY_COLOR } from "@/theme";

type SongLyricsProps = {
  children: React.ReactNode;
  color?: string;
};

export default function SongLyrics({
  children,
  color = PRIMARY_COLOR,
}: Readonly<SongLyricsProps>) {
  return (
    <Blockquote color={color} mt="xl">
      {children}
    </Blockquote>
  );
}
