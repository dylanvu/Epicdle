import {
  Button,
  Modal,
  Title,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { UseDisclosureHandlers } from "@mantine/hooks";
import styles from "./LegacyModal.module.css";
import { PRIMARY_COLOR } from "@/config/theme";
import { useButtonSound } from "@/hooks/audio/useButtonSound";
import ModalTitle from "../ModalTitle";
import { IconBow, IconSword } from "@tabler/icons-react";
import { getAvailableLegacyDates, hasLegacyDates } from "./legacyDateUtils";
import YearAccordion from "./LegacyTabContent/YearAccordion";

export default function LegacyModal({
  openState,
  modalHandler,
}: {
  openState: boolean;
  modalHandler: UseDisclosureHandlers;
}) {
  const playButtonSound = useButtonSound();
  
  // Get computed legacy dates for each mode
  const classicData = getAvailableLegacyDates("classic");
  const legendData = getAvailableLegacyDates("legend");
  
  const hasClassicDates = hasLegacyDates("classic");
  const hasLegendDates = hasLegacyDates("legend");

  return (
    <Modal
      opened={openState}
      onClose={() => {
        modalHandler.close();
        playButtonSound();
      }}
      title={<ModalTitle>Legacy Mode</ModalTitle>}
      className={styles.about}
      lockScroll={false}
      size="lg"
    >
      <Stack gap="xs">
        {/* --- Attribution / Credits Section --- */}
        <Title order={4}>Play Past Epicdles</Title>
        <Tabs defaultValue={"classic"} variant="default" color={PRIMARY_COLOR}>
          <Tabs.List>
            <Tabs.Tab value="classic" leftSection={<IconBow />}>
              Classic
            </Tabs.Tab>
            <Tabs.Tab value="legend" leftSection={<IconSword />}>
              Legend
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="classic">
            {hasClassicDates ? (
              <Stack gap="md" mt="sm">
                {classicData.years.map((yearData) => (
                  <YearAccordion 
                    key={yearData.year} 
                    year={yearData.year} 
                    months={yearData.months} 
                    mode="classic"
                  />
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" ta="center" mt="md">
                No legacy games available yet. Check back tomorrow!
              </Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="legend">
            {hasLegendDates ? (
              <Stack gap="md" mt="sm">
                {legendData.years.map((yearData) => (
                  <YearAccordion 
                    key={yearData.year} 
                    year={yearData.year} 
                    months={yearData.months} 
                    mode="legend"
                  />
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" ta="center" mt="md">
                No legacy games available yet. Check back tomorrow!
              </Text>
            )}
          </Tabs.Panel>
        </Tabs>    
        <Button
          onClick={() => {
            modalHandler.close();
            playButtonSound();
          }}
          mt="md"
          w="100%"
          color={PRIMARY_COLOR}
        >
          Close
        </Button>
      </Stack>
    </Modal>
  );
}
