import { CONFETTI_COLORS } from "@/theme";
import styles from "./ConfettiOverlay.module.css";
import Confetti from "react-confetti-boom";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function ConfettiOverlay({ perfect }: { perfect?: boolean }) {
  // (0, 0) is top left
  // (1, 1) is bottom right
  // (0, 1) is bottom left
  // (1, 0) is top right
  // degrees increasing is clockwise

  const isMobile = useIsMobile();

  const launchSpeed = 2;
  // reduce particle count on smaller screens just for performance reasons
  const particleMultiplier = perfect ? 1.5 : 0.5;
  const particleCount = particleMultiplier * (isMobile ? 50 : 100);
  const opacityDeltaMultiplier = perfect ? 0.5 : 2;
  const spreadDegree = perfect ? 30 : 60;
  return (
    <div className={styles.confettiOverlay}>
      {/* Bottom Left */}
      <Confetti
        x={0}
        y={1}
        colors={CONFETTI_COLORS}
        // Fire to the top right
        deg={300}
        launchSpeed={launchSpeed}
        particleCount={particleCount}
        opacityDeltaMultiplier={opacityDeltaMultiplier}
        spreadDeg={spreadDegree}
      />
      {/* Bottom Right */}
      <Confetti
        x={1}
        y={1}
        colors={CONFETTI_COLORS}
        // Fire to the top left
        deg={240}
        launchSpeed={launchSpeed}
        particleCount={particleCount}
        opacityDeltaMultiplier={opacityDeltaMultiplier}
        spreadDeg={spreadDegree}
      />
      {/* Animate more if it is a perfect win */}
      {perfect ? (
        <>
          <Confetti
            x={0}
            y={0}
            colors={CONFETTI_COLORS}
            // Fire to the bottom right
            deg={60}
            launchSpeed={launchSpeed}
            particleCount={particleCount}
            opacityDeltaMultiplier={opacityDeltaMultiplier}
            spreadDeg={spreadDegree}
          />
          <Confetti
            x={1}
            y={0}
            colors={CONFETTI_COLORS}
            // Fire to the bottom left
            deg={120}
            launchSpeed={launchSpeed}
            particleCount={particleCount}
            opacityDeltaMultiplier={opacityDeltaMultiplier}
            spreadDeg={spreadDegree}
          />
        </>
      ) : null}
    </div>
  );
}
