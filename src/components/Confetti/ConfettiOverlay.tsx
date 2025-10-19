import { PRIMARY_COLOR, WIN_COLOR } from "@/theme";
import styles from "./ConfettiOverlay.module.css";
import Confetti from "react-confetti-boom";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function ConfettiOverlay() {
  // (0, 0) is top left
  // (1, 1) is bottom right
  // (0, 1) is bottom left
  // (1, 0) is top right
  // degrees increasing is clockwise

  const isMobile = useIsMobile();

  const colors = [PRIMARY_COLOR];
  const launchSpeed = 2;
  // reduce particle count on smaller screens just for performance reasons
  const particleCount = isMobile ? 50 : 100;
  const opacityDeltaMultiplier = 2;
  return (
    <div className={styles.confettiOverlay}>
      {/* Bottom Left */}
      <Confetti
        x={0}
        y={1}
        colors={colors}
        // Fire to the top right
        deg={315}
        launchSpeed={launchSpeed}
        particleCount={particleCount}
        opacityDeltaMultiplier={opacityDeltaMultiplier}
      />
      {/* Bottom Right */}
      <Confetti
        x={1}
        y={1}
        colors={colors}
        // Fire to the topp left
        deg={225}
        launchSpeed={launchSpeed}
        particleCount={particleCount}
        opacityDeltaMultiplier={opacityDeltaMultiplier}
      />
    </div>
  );
}
