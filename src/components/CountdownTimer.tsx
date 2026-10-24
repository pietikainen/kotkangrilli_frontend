import { Title } from "@mantine/core";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useCallback, useEffect, useState } from "react";

dayjs.extend(duration);

interface CountdownProps {
  startDate: string;
}

const CountdownTimer = ({ startDate }: CountdownProps) => {
  const calculateTimeLeft = useCallback(() => {
    const eventTime = dayjs(startDate);
    const now = dayjs();
    const diff = eventTime.diff(now);

    if (diff <= 0)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };

    const dur = dayjs.duration(diff);

    return {
      days: dur.days(),
      hours: dur.hours(),
      minutes: dur.minutes(),
      seconds: dur.seconds(),
      milliseconds: dur.milliseconds(),
    };
  }, [startDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    let frameId: number;
    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
      frameId = requestAnimationFrame(updateTimer);
    };

    frameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(frameId);
  }, [calculateTimeLeft]);

  return (
    <Title
      order={2}
      size="h1"
      style={{
        backgroundImage:
          "linear-gradient(270deg, red, orange, yellow, green, dodgerblue, darkmagenta, violet)",
        backgroundSize: "400% 400%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "rainbowText 20s infinite linear",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {Object.entries(timeLeft).map(([unit, value], index) => (
        <React.Fragment key={unit}>
          {index > 0 && " "}
          <span style={{ whiteSpace: "nowrap" }}>
            {String(value).padStart(unit === "milliseconds" ? 3 : 2, "0")}
            {
              {
                days: "d",
                hours: "h",
                minutes: "m",
                seconds: "s",
                milliseconds: "ms",
              }[unit]
            }
          </span>
        </React.Fragment>
      ))}
    </Title>
  );
};

export default CountdownTimer;
