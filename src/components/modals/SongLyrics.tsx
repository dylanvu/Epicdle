import { Blockquote, StyleProp, MantineSpacing } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";

type SongLyricsProps = {
  children: React.ReactNode;
  mtOverride?: StyleProp<MantineSpacing> | null;
  color?: string;
};

export default function SongLyrics({
  children,
  mtOverride = "xl",
  color = PRIMARY_COLOR,
}: Readonly<SongLyricsProps>) {
  return (
    <Blockquote color={color} mt={mtOverride ?? undefined}>
      {children}
    </Blockquote>
  );
}
