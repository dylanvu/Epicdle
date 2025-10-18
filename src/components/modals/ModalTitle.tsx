import { Title } from "@mantine/core";

export default function ModalTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Title order={3}>{children}</Title>;
}
