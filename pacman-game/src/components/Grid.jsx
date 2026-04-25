import React from "react";

const Grid = ({ layout, pacman, ghost }) => {
  return (
    <div className="grid">
      {layout.map((cell, i) => {
        let className = "cell";

        if (cell === 1) className += " wall";
        if (cell === 0) className += " dot";
        if (i === pacman) className += " pacman";
        if (i === ghost) className += " ghost";

        return <div key={i} className={className}></div>;
      })}
    </div>
  );
};

export default Grid;