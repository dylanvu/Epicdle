"use client";
import { Slider, ActionIcon, Group } from "@mantine/core";
import { PRIMARY_COLOR } from "@/config/theme";
import { useEffect, useState } from "react";
import {
  IconVolume as FullVolumeIcon,
  IconVolume2 as LowVolumeIcon,
  IconVolume3 as OffVolumeIcon,
  IconVolumeOff as MuteVolumeIcon,
} from "@tabler/icons-react";
import { IVolumeObject } from "@/interfaces/interfaces";

export default function VolumeSlider({
  volumeObject,
  setVolumeObject,
}: {
  volumeObject: IVolumeObject;
  setVolumeObject: React.Dispatch<React.SetStateAction<IVolumeObject>>;
}) {
  const { volume, muted } = volumeObject;
  const toggleMute = () => {
    if (muted) {
      setVolumeObject({ volume, muted: false });
    } else {
      setVolumeObject({ volume, muted: true });
    }
  };

  const handleSliderChange = (value: number) => {
    setVolumeObject({ volume: value, muted });
  };

  const iconSize = 18;

  const renderVolumeIcon = () => {
    if (muted) return <MuteVolumeIcon size={iconSize} />;
    if (volume === 0) return <OffVolumeIcon size={iconSize} />;
    if (volume < 50) return <LowVolumeIcon size={iconSize} />;
    return <FullVolumeIcon size={iconSize} />;
  };

  return (
    <Group gap="sm" w="100%" mb="xs" align="center" wrap="nowrap">
      <ActionIcon
        variant="filled"
        color={PRIMARY_COLOR}
        radius="xl"
        size="lg"
        onClick={toggleMute}
        aria-pressed={muted}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {renderVolumeIcon()}
      </ActionIcon>

      <Slider
        color={PRIMARY_COLOR}
        value={volume}
        onChange={handleSliderChange}
        w="100%"
        disabled={muted}
        aria-label="Volume"
      />
    </Group>
  );
}
