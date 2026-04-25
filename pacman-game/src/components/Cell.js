import React from "react";

const Cell = ({ value, isPacman }) => {
  let className = "cell";

  if (value === 1) className += " wall";
  if (value === 0) className += " dot";
  if (isPacman) className += " pacman";

  return <div className={className}></div>;
};

export default Cell;