import { Text } from "@mantine/core";

export default function ModalTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Text size={"xl"}>{children}</Text>;
}
