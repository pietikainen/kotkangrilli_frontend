import {
  SiEpicgames,
  SiGogdotcom,
  SiUbisoft,
} from "@icons-pack/react-simple-icons";
import { Badge } from "@mantine/core";
import {
  IconBrandSteam,
  IconBrandXbox,
  IconLink,
  IconLinkOff,
} from "@tabler/icons-react";
import React from "react";

export function getLink(link: string | null | undefined, store: string) {
  if (link) {
    if (link.includes("steampowered.com")) {
      return (
        <Badge
          leftSection={<IconBrandSteam size={14} />}
          variant="gradient"
          gradient={{ from: "#111d2e", to: "#1387b8", deg: 180 }}
          component="a"
          href={link}
          target="_blank"
          styles={{ root: { cursor: "pointer" } }}
        >
          {store}
        </Badge>
      );
    }
    if (link.includes("gog.com")) {
      return (
        <Badge
          leftSection={<SiGogdotcom size={14} />}
          variant="default"
          color="gray"
          component="a"
          href={link}
          target="_blank"
          styles={{ root: { cursor: "pointer" } }}
        >
          {store}
        </Badge>
      );
    }
    if (link.includes("epicgames.com")) {
      return (
        <Badge
          leftSection={<SiEpicgames size={14} />}
          variant="default"
          color="gray"
          component="a"
          href={link}
          target="_blank"
          styles={{ root: { cursor: "pointer" } }}
        >
          {store}
        </Badge>
      );
    }
    if (link.includes("ubisoft.com") || link.includes("ubi.com")) {
      return (
        <Badge
          leftSection={<SiUbisoft size={14} />}
          variant="default"
          color="gray"
          component="a"
          href={link}
          target="_blank"
          styles={{ root: { cursor: "pointer" } }}
        >
          {store}
        </Badge>
      );
    }
    if (link.includes("xbox.com") || link.includes("microsoft.com")) {
      return (
        <Badge
          leftSection={<IconBrandXbox size={14} />}
          color="#107810"
          component="a"
          href={link}
          target="_blank"
          styles={{ root: { cursor: "pointer" } }}
        >
          {store}
        </Badge>
      );
    }
    return (
      <Badge
        leftSection={<IconLink size={14} />}
        component="a"
        href={link}
        target="_blank"
        styles={{ root: { cursor: "pointer" } }}
      >
        {store}
      </Badge>
    );
  }

  return (
    <Badge leftSection={<IconLinkOff size={14} />} color="gray">
      {store}
    </Badge>
  );
}
