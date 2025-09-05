import styles from "./Epicdle.module.css";
import { FONT_CLASS_NAME } from "./EpicdleCommon";
import { Text } from "@mantine/core";

export default function EpicdleTitle({ allCaps }: { allCaps?: boolean }) {
  const title = "Epicdle";
  return (
    <Text className={`${FONT_CLASS_NAME} ${styles.title}`}>
      {allCaps ? title.toUpperCase() : title}
    </Text>
  );
}
