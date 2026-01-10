import {
  Title,
  Accordion,
  SimpleGrid,
  Button,
  Box
} from "@mantine/core";
import { PRIMARY_COLOR, LEGENDARY_BOTTOM_GRADIENT_COLOR } from "@/config/theme";
import { MonthData } from "../legacyDateUtils";

export default function YearAccordion({year, months, mode}: {year: number, months: MonthData[], mode: "classic" | "legend"}) {

  // Extract just the day portion (e.g., "9th" from "Jan. 9th")
  const getDayLabel = (dateStr: string): string => {
    const parts = dateStr.split(' ');
    return parts.length > 1 ? parts[1] : dateStr;
  };

  let color = mode === "classic" ? PRIMARY_COLOR : LEGENDARY_BOTTOM_GRADIENT_COLOR

  return (
    <Box>
      <Title order={5}>{year}</Title>
      <Accordion variant="contained">
        {months.map((month) => 
          <Accordion.Item key={month.month} value={month.month}>
            <Accordion.Control>{month.month}</Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid cols={{ base: 5, sm: 6 }} spacing="xs">
                {month.dates.map((date) => 
                  <Button
                    key={date.dateKey}
                    component="a"
                    href={`/legacy/${mode}?date=${date.dateKey}`}
                    size="xs"
                    variant="light"
                    color={color}
                  >
                    {getDayLabel(date.date)}
                  </Button>
                )}
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>)
        }
      </Accordion>
    </Box>
  )
}
