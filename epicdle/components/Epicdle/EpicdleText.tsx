import styles from "./Epicdle.module.css";
import { FONT_CLASS_NAME } from "./EpicdleCommon";
import { Text } from "@mantine/core";

export default function EpicdleText() {
  return <Text className={`${FONT_CLASS_NAME} ${styles.text}`}>Epicdle</Text>;
}
