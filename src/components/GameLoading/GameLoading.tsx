"use client";
import { PRIMARY_COLOR } from "@/config/theme";
import { Center, Group, Loader, Stack, Title } from "@mantine/core";
import { motion } from "motion/react";
import { useIsMobile } from "@/hooks/useIsMobile";

export function GameLoading() {
  const isMobile = useIsMobile();

  return (
    <motion.div
      key="game-page-initial-loading"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45 }}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <Center h={"100vh"}>
        {isMobile ? (
          <Stack justify="center" align="center">
            <Loader color={PRIMARY_COLOR} size="xl" />
            <Title>Loading Epicdle...</Title>
          </Stack>
        ) : (
          <Group>
            <Title>Loading Epicdle...</Title>
            <Loader color={PRIMARY_COLOR} size="xl" />
          </Group>
        )}
      </Center>
    </motion.div>
  );
}
