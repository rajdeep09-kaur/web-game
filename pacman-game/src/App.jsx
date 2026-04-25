import React, { useState, useEffect } from "react";
import Grid from "./components/Grid";
import { layout as initialLayout } from "./game/layout";
import "./styles.css";

function App() {
  const width = 20;

  const [direction, setDirection] = useState(null);
  const [pacman, setPacman] = useState(210);
  const [ghost, setGhost] = useState(50);
  const [ghostDir, setGhostDir] = useState(null);

  const [grid, setGrid] = useState(initialLayout);
  const [score, setScore] = useState(0);

  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [history, setHistory] = useState([]);

  // 🎮 Load scores
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("scores")) || [];
    setHistory(saved);
  }, []);

  // 🎮 Key Controls
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver || win) return;

      if (e.key === "ArrowUp") setDirection("UP");
      if (e.key === "ArrowDown") setDirection("DOWN");
      if (e.key === "ArrowLeft") setDirection("LEFT");
      if (e.key === "ArrowRight") setDirection("RIGHT");
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver, win]);

  // 🔁 Pac-Man Movement
  useEffect(() => {
    if (gameOver || win) return;

    const interval = setInterval(() => {
      setPacman((prev) => {
        let next = prev;

        if (direction === "UP") next -= width;
        if (direction === "DOWN") next += width;
        if (direction === "LEFT") next -= 1;
        if (direction === "RIGHT") next += 1;

        if (next < 0 || next >= grid.length) return prev;
        if (grid[next] === 1) return prev;

        // 🍒 Eat dot
        if (grid[next] === 0) {
          const newGrid = [...grid];
          newGrid[next] = 2;
          setGrid(newGrid);
          setScore((s) => s + 1);
        }

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [direction, grid, gameOver, win]);

  // 👻 SMART Ghost Movement (Fixed)
  useEffect(() => {
    if (gameOver || win) return;

    const interval = setInterval(() => {
      setGhost((prev) => {
        const moves = [
          { step: -1, dir: "LEFT" },
          { step: 1, dir: "RIGHT" },
          { step: -width, dir: "UP" },
          { step: width, dir: "DOWN" },
        ];

        const opposite = {
          LEFT: "RIGHT",
          RIGHT: "LEFT",
          UP: "DOWN",
          DOWN: "UP",
        };

        let possibleMoves = moves.filter(({ step, dir }) => {
          const next = prev + step;

          if (next < 0 || next >= grid.length) return false;
          if (grid[next] === 1) return false;

          // ❌ prevent reverse
          if (ghostDir && dir === opposite[ghostDir]) return false;

          return true;
        });

        // fallback if stuck
        if (possibleMoves.length === 0) {
          possibleMoves = moves.filter(({ step }) => {
            const next = prev + step;
            return next >= 0 && next < grid.length && grid[next] !== 1;
          });
        }

        // 🎲 random movement (30%)
        if (Math.random() < 0.3) {
          const move =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          setGhostDir(move.dir);
          return prev + move.step;
        }

        // 🧠 chase logic
        let minDistance = Infinity;
        let bestMoves = [];

        possibleMoves.forEach((move) => {
          const next = prev + move.step;
          const distance = Math.abs(next - pacman);

          if (distance < minDistance) {
            minDistance = distance;
            bestMoves = [move];
          } else if (distance === minDistance) {
            bestMoves.push(move);
          }
        });

        const chosen =
          bestMoves[Math.floor(Math.random() * bestMoves.length)];

        setGhostDir(chosen.dir);
        return prev + chosen.step;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [pacman, grid, gameOver, win, ghostDir]);

  // 💀 Game Over
  useEffect(() => {
    if (pacman === ghost && !gameOver && !win) {
      setGameOver(true);

      const newScores = [...history, score];
      localStorage.setItem("scores", JSON.stringify(newScores));
      setHistory(newScores);
    }
  }, [pacman, ghost]);

  // 🏆 Win Condition
  useEffect(() => {
    if (!grid.includes(0) && !gameOver) {
      setWin(true);

      const newScores = [...history, score];
      localStorage.setItem("scores", JSON.stringify(newScores));
      setHistory(newScores);
    }
  }, [grid]);

  // 🔁 Restart
  const restartGame = () => {
    setPacman(210);
    setGhost(50);
    setGhostDir(null);
    setGrid(initialLayout);
    setScore(0);
    setDirection(null);
    setGameOver(false);
    setWin(false);
  };

  return (
    <div className="container">
      <h1 className="title">PAC-MAN</h1>

      <div className="scoreboard">
        <span>Score: {score}</span>
        <span>High Score: {Math.max(0, ...history)}</span>
      </div>

      <div className="history">
        {[...history].reverse().slice(0, 5).map((s, i) => (
          <span key={i} className="badge">
            {s}
          </span>
        ))}
      </div>

      <div className="game">
        <Grid layout={grid} pacman={pacman} ghost={ghost} />

        {(gameOver || win) && (
          <div className="overlay">
            {win ? (
              <>
                <h2 style={{ color: "lime" }}>YOU WIN 🎉</h2>
                <p>Score: {score}</p>
              </>
            ) : (
              <>
                <h2>GAME OVER</h2>
                <p>Score: {score}</p>
              </>
            )}

            <button onClick={restartGame}>PLAY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;