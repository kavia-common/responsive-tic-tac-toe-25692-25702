/**
 * PUBLIC_INTERFACE
 * Board
 * Fully interactive 3x3 Tic Tac Toe board with accessible controls, alternating turns,
 * win/draw detection, score keeping, and reset. Styled to match the Ocean Professional theme.
 */
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import styles from './Board.module.css';

/**
 * Helper: all winning line index triplets for a 3x3 board.
 */
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * PUBLIC_INTERFACE
 * getWinner
 * Determine winner ('X' | 'O') or return null; also returns the winning line indices.
 */
function getWinner(cells) {
  for (const [a, b, c] of WIN_LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

/**
 * PUBLIC_INTERFACE
 * Cell
 * Accessible interactive tile for the board grid; renders X/O marks, highlights winning cells,
 * and supports keyboard activation.
 */
function Cell({ index, symbol, onClick, disabled, isWinning }) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(index);
      }
    },
    [onClick, index, disabled]
  );

  const label = useMemo(() => {
    const base = `Cell row ${row} column ${col}`;
    return symbol ? `${base}, ${symbol}` : base;
  }, [row, col, symbol]);

  // Style modifiers
  const markColor =
    symbol === 'X' ? 'text-48d2fe' : symbol === 'O' ? 'text-e2be00' : '';
  const winningClass = isWinning ? styles.winning : '';
  const disabledAttr = disabled ? { 'aria-disabled': true } : {};

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      className={`${styles.tile} bg-43115b radius-10 ${winningClass}`}
      onClick={() => !disabled && onClick?.(index)}
      onKeyDown={handleKeyDown}
      data-row={row}
      data-col={col}
      {...disabledAttr}
    >
      <div className={`${styles.tileInner} radius-10`} aria-hidden="true" />
      {symbol && (
        <div
          className={`typo-9 ${markColor}`}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 8,
            textAlign: 'center',
            width: '100%',
            userSelect: 'none',
            transition: 'transform 160ms ease, opacity 160ms ease',
            zIndex: 2 /* ensure mark sits above overlay */
          }}
        >
          {symbol}
        </div>
      )}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * ScoreCard
 * Small card showing a label and a numeric score.
 */
function ScoreCard({ label, value, colorClass }) {
  return (
    <div className={`${styles.scoreCard} radius-10 ${colorClass}`} role="group" aria-label={`${label} score`}>
      <div className={`${styles.scoreLabel} typo-11 text-000000`}>{label.toUpperCase()}</div>
      <div className={`${styles.scoreValueWrap} radius-10 bg-ffffff center`}>
        <div className="typo-12 text-000000" aria-live="polite">{value}</div>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Board component wrapper with responsive scaling similar to Figma canvas approach,
 * plus complete gameplay state management and accessible UI updates.
 */
export default function Board() {
  // Gameplay state
  const [cells, setCells] = useState(Array(9).fill(null)); // 0..8
  const [xIsNext, setXIsNext] = useState(true);
  const [{ x, o, draw }, setScores] = useState({ x: 0, draw: 0, o: 0 });
  const [statusMessage, setStatusMessage] = useState('');
  const [winningLine, setWinningLine] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Scale-to-fit logic inspired by assets/app.js but implemented with React refs/effects
  const baseWidth = 2856;
  const baseHeight = 1726;
  const wrapperRef = useRef(null);
  const scalerRef = useRef(null);

  useEffect(() => {
    function fitScale() {
      const wrapper = wrapperRef.current;
      const scaler = scalerRef.current;
      if (!wrapper || !scaler) return;

      const vw = wrapper.clientWidth;
      const vh = wrapper.clientHeight;
      const scale = Math.min(vw / baseWidth, vh / baseHeight);
      scaler.style.width = `${baseWidth}px`;
      scaler.style.height = `${baseHeight}px`;
      scaler.style.transformOrigin = 'top left';
      scaler.style.willChange = 'transform';
      scaler.style.transform = `scale(${scale})`;
    }

    fitScale();
    window.addEventListener('resize', fitScale);
    return () => window.removeEventListener('resize', fitScale);
  }, []);

  // Compute game status after every move
  useEffect(() => {
    const { winner, line } = getWinner(cells);
    if (winner) {
      setWinningLine(line);
      setGameOver(true);
      setStatusMessage(`Player ${winner} wins!`);
      setScores((prev) => (winner === 'X' ? { ...prev, x: prev.x + 1 } : { ...prev, o: prev.o + 1 }));
      return;
    }
    const allFilled = cells.every(Boolean);
    if (allFilled) {
      setGameOver(true);
      setStatusMessage('Draw! Nobody wins.');
      setScores((prev) => ({ ...prev, draw: prev.draw + 1 }));
      return;
    }
    setStatusMessage(`Turn: Player ${xIsNext ? 'X' : 'O'}`);
    setWinningLine([]);
    setGameOver(false);
  }, [cells, xIsNext]);

  // PUBLIC_INTERFACE
  const handleCellClick = useCallback(
    (index) => {
      if (gameOver || cells[index]) return; // ignore if finished or already set
      setCells((prev) => {
        const next = [...prev];
        next[index] = xIsNext ? 'X' : 'O';
        return next;
      });
      setXIsNext((prev) => !prev);
    },
    [gameOver, cells, xIsNext]
  );

  // PUBLIC_INTERFACE
  const resetBoard = useCallback(() => {
    setCells(Array(9).fill(null));
    setXIsNext(true);
    setWinningLine([]);
    setGameOver(false);
    setStatusMessage('Turn: Player X');
  }, []);

  // ARIA live region for status
  const statusAria = useMemo(
    () => (gameOver ? 'assertive' : 'polite'),
    [gameOver]
  );

  // Build rows/cols
  const rows = [0, 1, 2];
  const cols = [0, 1, 2];

  return (
    <div className={styles.canvasWrapper} ref={wrapperRef} aria-label="Tic Tac Toe Canvas Wrapper">
      <div className={styles.canvasScaler} ref={scalerRef}>
        <div className={styles.canvas} role="region" aria-label="Board — 52:9">
          {/* Main inner board section */}
          <section
            className={`${styles.boardSection} bg-2b0040 radius-50`}
            aria-label="Tic Tac Toe Board"
          >
            {/* Top scores and status */}
            <div className={styles.scoresRow} role="group" aria-label="Scores">
              <ScoreCard label="Player X" value={x} colorClass="bg-48d2fe" />
              <ScoreCard label="Draw" value={draw} colorClass="bg-bcdbf9" />
              <ScoreCard label="Player O" value={o} colorClass="bg-e2be00" />
            </div>

            {/* Status message and reset button (placed visually below scores; ARIA live for updates) */}
            <div
              className={`${styles.statusBar} typo-12`}
              aria-live={statusAria}
              aria-atomic="true"
            >
              <span className={styles.statusText}>
                {statusMessage || 'Turn: Player X'}
              </span>
              <button
                type="button"
                onClick={resetBoard}
                className={styles.resetBtn}
                aria-label="Reset the current game"
              >
                Reset
              </button>
            </div>

            {/* Board grid */}
            <div className={`${styles.gridWrap} radius-12 bg-2b0040`} role="grid" aria-label="3 by 3 grid">
              {rows.map((r) => (
                <div className={styles.gridRow} role="row" key={`row-${r}`}>
                  {cols.map((c) => {
                    const flatIndex = r * 3 + c;
                    return (
                      <div role="gridcell" key={`cell-${r}-${c}`} className={styles.gridCell}>
                        <Cell
                          index={flatIndex}
                          symbol={cells[flatIndex]}
                          onClick={handleCellClick}
                          disabled={gameOver}
                          isWinning={winningLine.includes(flatIndex)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* Decorative bottom badge */}
          <div className={`${styles.badge} radius-15 bg-975fb1 flex-row`} aria-hidden="true">
            <div className="typo-12 text-2b0040" style={{ marginLeft: 20 }}>Made with Figma</div>
          </div>

          {/* Decorative big headline */}
          <div className={`${styles.headline} text-dcbf3f`} aria-hidden="true">
            <span className={styles.headlineLine}>tic.</span>
            <span className={styles.headlineLine}>tac.toe.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
