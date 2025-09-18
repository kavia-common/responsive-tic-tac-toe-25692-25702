/**
 * PUBLIC_INTERFACE
 * Board
 * A presentational component that renders a 3x3 Tic Tac Toe board UI based on the provided Figma extraction.
 * This includes the score header and decorative elements. No gameplay logic is implemented here.
 */
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import styles from './Board.module.css';

/**
 * PUBLIC_INTERFACE
 * Cell
 * Accessible interactive tile for the board grid.
 */
function Cell({ row, col, onClick }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(row, col);
    }
  }, [onClick, row, col]);

  const label = useMemo(() => `Cell row ${row} column ${col}`, [row, col]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      className={`${styles.tile} bg-43115b radius-10`}
      onClick={() => onClick?.(row, col)}
      onKeyDown={handleKeyDown}
      data-row={row}
      data-col={col}
    >
      {/* Placeholder for token content per Figma (empty) */}
      <div className={`${styles.tileInner} radius-10`} aria-hidden="true" />
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
 * Board component wrapper with responsive scaling similar to Figma canvas approach.
 */
export default function Board() {
  // faux state for scores (no game logic required)
  const [scores] = useState({ x: 0, draw: 0, o: 0 });

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

  const onCellClick = useCallback((row, col) => {
    // For now, simple log to match original demo behavior
    // eslint-disable-next-line no-console
    console.log('Cell clicked:', { row, col });
  }, []);

  // Build the 3x3 cells using the relative positioning translated to a grid layout.
  // We preserve sizing and spacing visually consistent with the Figma (150px tiles with gaps).
  const rows = [1, 2, 3];
  const cols = [1, 2, 3];

  return (
    <div className={styles.canvasWrapper} ref={wrapperRef} aria-label="Tic Tac Toe Canvas Wrapper">
      <div className={styles.canvasScaler} ref={scalerRef}>
        <div className={styles.canvas} role="region" aria-label="Board — 52:9">
          {/* Main inner board section */}
          <section
            className={`${styles.boardSection} bg-2b0040 radius-50`}
            aria-label="Tic Tac Toe Board"
          >
            {/* Top scores */}
            <div className={styles.scoresRow} role="group" aria-label="Scores">
              <ScoreCard label="Player X" value={scores.x} colorClass="bg-48d2fe" />
              <ScoreCard label="Draw" value={scores.draw} colorClass="bg-bcdbf9" />
              <ScoreCard label="Player O" value={scores.o} colorClass="bg-e2be00" />
            </div>

            {/* Board grid */}
            <div className={`${styles.gridWrap} radius-12 bg-2b0040`} role="grid" aria-label="3 by 3 grid">
              {rows.map((r) => (
                <div className={styles.gridRow} role="row" key={`row-${r}`}>
                  {cols.map((c) => (
                    <div role="gridcell" key={`cell-${r}-${c}`} className={styles.gridCell}>
                      <Cell row={r} col={c} onClick={onCellClick} />
                    </div>
                  ))}
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
