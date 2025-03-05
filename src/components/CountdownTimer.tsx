import { Title } from "@mantine/core";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import React, { useEffect, useState } from "react";

dayjs.extend(duration);

interface CountdownProps {
  startDate: string;
}

const CountdownTimer = ({ startDate }: CountdownProps) => {
  const calculateTimeLeft = () => {
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
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
      requestAnimationFrame(updateTimer);
    };

    requestAnimationFrame(updateTimer);
  }, [startDate]);

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
      }}
    >
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s{" "}
      {timeLeft.milliseconds}ms
    </Title>
  );
};

export default CountdownTimer;
