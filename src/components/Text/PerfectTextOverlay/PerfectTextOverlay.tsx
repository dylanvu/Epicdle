import { Text } from "@mantine/core";
import { FONT_CLASS_NAME } from "@/components/Text/Epicdle/EpicdleCommon";
import styles from "./Perfect.module.css";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { playAudioWithoutUseSound } from "@/hooks/audio/useGameAudio";

export default function PerfectTextOverlay({
  show,
  text,
}: {
  show: boolean;
  text: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      playAudioWithoutUseSound("/sfx/sword_slash_and_swing.mp3");
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 1, 1, 0], // linger at full opacity then fade
            scale: [0.6, 1.15, 0.98, 1, 0.9], // pop overshoot, settle, shrink on exit
          }}
          transition={{
            duration: 2.5,
            times: [0, 0.1, 0.3, 0.9, 1], // timing of keyframes
            ease: "easeOut",
          }}
          aria-hidden={!visible}
          className={styles.perfectTextOverlay}
          style={{
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            className={`${FONT_CLASS_NAME} ${styles.perfectText}`}
            ta="center"
            c={"#00C2FF"}
            fw={700}
          >
            {text.toUpperCase()}
          </Text>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
