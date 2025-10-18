// hooks/useWaveAnimation.ts
import { useCallback } from "react";
import type {
  AnimationOptions,
  AnimationPlaybackControlsWithThen,
  DOMKeyframesDefinition,
  Easing,
  ElementOrSelector,
} from "motion/react";
import { Song } from "@/interfaces/interfaces";

type AnimateFn = (
  target: Element | string | any,
  keyframes: any,
  options?: { duration?: number; delay?: number; ease?: Easing | string }
) => Promise<any> | void;

type UseWaveAnimationParams = {
  scope: React.RefObject<HTMLElement | null>;
  animateWave: (
    element: ElementOrSelector,
    keyframes: DOMKeyframesDefinition,
    options?: AnimationOptions | undefined
  ) => AnimationPlaybackControlsWithThen;
  guesses: Song[];
  maxGuesses: number;
};

type PerformWaveOptions = {
  amplitude?: number;
  duration?: number;
  stagger?: number;
  easing?: Easing;
  onlyFilled?: boolean;
  onlyCurrent?: boolean;
};

export function useWaveAnimation({
  scope,
  animateWave,
  guesses,
  maxGuesses,
}: UseWaveAnimationParams) {
  const performWaveAnimation = useCallback(
    ({
      amplitude = 20,
      duration = 0.45,
      stagger = 0.06,
      easing = "easeInOut",
      onlyFilled = false,
      onlyCurrent = false,
    }: PerformWaveOptions = {}) => {
      if (!scope?.current || typeof animateWave !== "function") return;

      for (let i = 0; i < maxGuesses; i++) {
        if (onlyFilled && i >= (guesses?.length ?? 0)) continue;
        if (onlyCurrent && i !== (guesses?.length ?? 0)) continue;

        const el = scope.current.querySelector(`[data-guess-index="${i}"]`);
        if (!el) continue;

        animateWave(
          el,
          {
            y: [0, -amplitude, 0],
            scaleY: [1, 0.92, 1],
            scaleX: [1, 1.04, 1],
          },
          {
            duration,
            delay: i * stagger,
            ease: easing,
          }
        );
      }
    },
    [scope, animateWave, guesses, maxGuesses]
  );

  return performWaveAnimation;
}

export default useWaveAnimation;
