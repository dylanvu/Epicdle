import { ActionIcon } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { PRIMARY_COLOR } from "@/theme";

export default function MobileSearchButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <ActionIcon
      variant="filled"
      aria-label="Submit Guess"
      size={56}
      radius="lg"
      onClick={onClick}
      color={PRIMARY_COLOR}
      disabled={disabled}
    >
      <IconArrowRight style={{ width: "70%", height: "70%" }} stroke={1.5} />
    </ActionIcon>
  );
}
