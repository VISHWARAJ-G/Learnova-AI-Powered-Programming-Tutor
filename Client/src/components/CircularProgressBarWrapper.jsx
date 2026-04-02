import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function CircularProgressBarWrapper({
  percentage,
  color,
  bg,
  textColor,
  text,
  widthSize,
}) {
  return (
    <div
      className="flex items-center gap-4"
      style={{
        width: "100%",
      }}
    >
      <div style={{ width: widthSize || 100 }}>
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: textColor,
            pathColor: color,
            trailColor: bg,
            textSize: "17.5px",
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
      {text && (
        <blockquote
          style={{
            fontSize: "12px",
            color: "#6b7280",
            fontWeight: "500",
            lineHeight: "1.4",
          }}
        >
          "{text}"
        </blockquote>
      )}
    </div>
  );
}

export default CircularProgressBarWrapper;
