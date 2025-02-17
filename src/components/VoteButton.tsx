import { Button } from "@mantine/core";
import React from "react";
import classes from "./VoteButton.module.css";

interface VoteButtonProps {
  onClick: () => void;
  isVoted: boolean;
  disabled: boolean;
}

const VoteButton = ({ onClick, isVoted, disabled }: VoteButtonProps) => {
  return isVoted ? (
    <Button
      className={classes.button}
      onClick={onClick}
      color="red"
      disabled={disabled}
    >
      Poista ääni
    </Button>
  ) : (
    <Button className={classes.button} onClick={onClick} disabled={disabled}>
      Äänestä
    </Button>
  );
};

export default VoteButton;
