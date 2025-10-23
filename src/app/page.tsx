"use client";

import styles from "./page.module.css";
import Menu from "@/components/Menu/Menu";
import EpicdleTitle from "@/components/Text/Epicdle/EpicdleTitle";
import CountdownTimer from "@/components/CountdownTimer/CountdownTimer";
import { useEffect, useState } from "react";
import { getCentralNow } from "@/util/time";
import { MAX_GUESSES } from "@/constants";
import { Center, Group, Loader, Stack, Title } from "@mantine/core";
import { PRIMARY_COLOR } from "@/theme";
import { AnimatePresence, motion } from "motion/react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  const isMobile = useIsMobile();

  useEffect(() => {
    const tick = () => {
      const newNow = getCentralNow();
      setNow(newNow);
      const nextMidnight = new Date(
        newNow.getFullYear(),
        newNow.getMonth(),
        newNow.getDate() + 1
      );
      setRemainingMs(nextMidnight.getTime() - newNow.getTime());
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <main className={styles.page}>
      <AnimatePresence
        onExitComplete={() => {
          setShowMainMenu(true);
        }}
      >
        {now ? null : (
          <motion.div
            key={"loading-main-page"}
            exit={{
              opacity: 0,
            }}
          >
            <Center>
              <Stack justify="center" align="center">
                <Loader color={PRIMARY_COLOR} size="xl" />
                <Title>Welcome to Epicdle!</Title>
              </Stack>
            </Center>
          </motion.div>
        )}
        {showMainMenu && now ? (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.45 }}
          >
            <EpicdleTitle />
            <div>
              Guess the Epic: The Musical song in {MAX_GUESSES} chances!
            </div>
            <CountdownTimer time={now} remainingMs={remainingMs} />
            <Menu />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
