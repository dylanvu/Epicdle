import { Text } from "@mantine/core";
import { FONT_CLASS_NAME } from "@/components/Text/Epicdle/EpicdleCommon";

export default function ModalTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text size={"xl"} className={FONT_CLASS_NAME}>
      {children}
    </Text>
  );
}
