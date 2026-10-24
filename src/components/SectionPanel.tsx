import { Box, Group, Paper, Title, type PaperProps } from "@mantine/core";
import { useId, type ReactNode } from "react";
import classes from "./SectionPanel.module.css";

type SectionPanelProps = PaperProps & {
  title: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
};

export default function SectionPanel({
  title,
  icon,
  aside,
  children,
  ...props
}: SectionPanelProps) {
  const titleId = useId();

  return (
    <Paper component="section" aria-labelledby={titleId} {...props}>
      <Group
        className={classes.header}
        justify="space-between"
        wrap="wrap"
        gap="xs"
      >
        <Group gap="xs" wrap="nowrap" className={classes.heading}>
          {icon}
          <Title id={titleId} order={2} size="h4">
            {title}
          </Title>
        </Group>
        {aside}
      </Group>
      <Box p="sm">{children}</Box>
    </Paper>
  );
}
