import { Box, SimpleGrid, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import classes from "./CountdownTimer.module.css";

interface CountdownProps {
  startDate: string;
}

const units = [
  { key: "days", label: "päivää", milliseconds: 86400000, modulo: Infinity },
  { key: "hours", label: "tuntia", milliseconds: 3600000, modulo: 24 },
  { key: "minutes", label: "minuuttia", milliseconds: 60000, modulo: 60 },
  { key: "seconds", label: "sekuntia", milliseconds: 1000, modulo: 60 },
  { key: "milliseconds", label: "ms", milliseconds: 1, modulo: 1000 },
] as const;

export default function CountdownTimer({ startDate }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());
  const timeLeft = Math.max(0, dayjs(startDate).diff(now));

  useEffect(() => {
    let frameId: number;
    const updateTimer = () => {
      setNow(Date.now());
      frameId = window.requestAnimationFrame(updateTimer);
    };
    frameId = window.requestAnimationFrame(updateTimer);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <SimpleGrid
      cols={5}
      spacing={4}
      className={classes.timer}
      role="timer"
      aria-label="Aikaa tapahtuman alkuun"
      aria-live="off"
    >
      {units.map(({ key, label, milliseconds, modulo }) => {
        const value = Math.floor(timeLeft / milliseconds) % modulo;

        return (
          <Box key={key} className={classes.segment}>
            <Text className={classes.digits}>
              {String(value).padStart(key === "milliseconds" ? 3 : 2, "0")}
            </Text>
            <Text className={classes.unit}>{label}</Text>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}
