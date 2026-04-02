import ProgressBar from "@ramonak/react-progress-bar";
import React from "react";

function ProgressBarWrapper({
  value = 0,
  color = "#1E88E5",
  bg = "#E0E0E0",
  height = "7px",
  showLabel = false,
}) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <ProgressBar
      completed={v}
      maxCompleted={100}
      bgColor={color}
      baseBgColor={bg}
      height={height}
      borderRadius="12px"
      labelSize="12px"
      labelColor="#0F172A"
      isLabelVisible={showLabel}
      animateOnRender
    />
  );
}

export default ProgressBarWrapper;
