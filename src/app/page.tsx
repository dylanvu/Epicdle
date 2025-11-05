"use client";

import styles from "./page.module.css";
import Menu from "@/components/Menu/Menu";
import EpicdleTitle from "@/components/Text/Epicdle/EpicdleTitle";
import CountdownTimer from "@/components/CountdownTimer/CountdownTimer";
import { useEffect, useState } from "react";
import { getNextResetTime } from "@/util/time";
import { Center, Loader, Title } from "@mantine/core";
import { PRIMARY_COLOR } from "@/theme";
import { AnimatePresence, motion } from "motion/react";

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const tick = () => {
      const newNow = new Date();
      setNow(newNow);
      const nextMidnight = getNextResetTime(newNow);
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
              <div className={styles.responsiveLoader}>
                <Title>Welcome to Epicdle!</Title>
                <Loader color={PRIMARY_COLOR} size="xl" />
              </div>
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
              Guess today's <strong>Epic: The Musical</strong> song!
            </div>
            <CountdownTimer time={now} remainingMs={remainingMs} />
            <Menu />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
