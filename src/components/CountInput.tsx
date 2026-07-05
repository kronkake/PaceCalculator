import React, { InputHTMLAttributes, useEffect, useRef } from "react";
import styled from "styled-components";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* Let the control shrink below its content size in row layouts. */
  min-width: 0;
`;

const CountButtonLayout = styled.div`
  display: flex;
  align-items: stretch;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  transition: outline 0.25s ease, background-color 0.25s ease;
  outline: 2px solid transparent;

  &:focus-within {
    outline: 2px solid var(--color-focus-ring);
  }
`;

const Input = styled.input`
  flex: 1 1 0;
  /* Without this, the input's intrinsic width makes the row overflow and
     the clipped pill hides the input on narrow screens. */
  min-width: 0;
  display: block;
  text-align: center;
  border: none;
  font-size: 1.2rem;
  padding: 0.6em 0.25em;

  @media (max-width: 560px) {
    font-size: 1rem;
    padding: 0.6em 0.15em;
  }
  background: transparent;
  color: var(--color-text);
  outline: none;
  appearance: textfield;

  &::placeholder {
    color: var(--color-text-muted);
    opacity: 0.6;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5em;
  font-size: 0.95rem;
  color: var(--color-text-muted);
`;

const CountButton = styled.button`
  display: block;
  flex: 0 0 auto;
  border: none;
  padding: 0.5em 0.75em;
  min-width: 2.75em;
  font-size: 1.4rem;

  @media (max-width: 560px) {
    font-size: 1.1rem;
    min-width: 2em;
    padding: 0.5em 0.4em;
  }
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  background: transparent;
  color: var(--color-text);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: background-color 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background: var(--color-surface-alt-hover);
    }
  }

  &:active,
  &[data-pressed] {
    background: var(--color-surface-alt-active);
  }
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

// Hold-to-repeat tuning: the action fires once on press, then after the
// initial delay it repeats, accelerating towards the minimum interval.
const HOLD_START_DELAY_MS = 350;
const HOLD_START_INTERVAL_MS = 140;
const HOLD_MIN_INTERVAL_MS = 40;
const HOLD_ACCELERATION = 0.88;

type Direction = "increment" | "decrement";

export const CountInput = ({
  label,
  onIncrement,
  onDecrement,
  ...props
}: InputProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read the handlers through a ref so a long hold keeps calling the latest
  // callbacks instead of the ones captured when the press started.
  const actionsRef = useRef({ increment: onIncrement, decrement: onDecrement });
  actionsRef.current = { increment: onIncrement, decrement: onDecrement };

  const stopHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => stopHold, []);

  const startHold = (direction: Direction) => {
    stopHold();
    actionsRef.current[direction]?.();

    const repeat = (interval: number) => {
      actionsRef.current[direction]?.();
      timerRef.current = setTimeout(
        () => repeat(Math.max(HOLD_MIN_INTERVAL_MS, interval * HOLD_ACCELERATION)),
        interval
      );
    };

    timerRef.current = setTimeout(
      () => repeat(HOLD_START_INTERVAL_MS),
      HOLD_START_DELAY_MS
    );
  };

  const handlePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    direction: Direction
  ) => {
    if (!actionsRef.current[direction]) return;
    // Keep the press from stealing focus (which would blur the input and
    // trigger its recalculation mid-hold) and from starting a text selection.
    e.preventDefault();
    // Capture the pointer so the hold survives the finger/cursor drifting
    // off the button, and reliably ends on pointerup/cancel.
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.pressed = "";
    startHold(direction);
  };

  const endHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    delete e.currentTarget.dataset.pressed;
    stopHold();
  };

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    direction: Direction
  ) => {
    // Pointer presses already fired the action; detail === 0 means the
    // button was activated with the keyboard.
    if (e.detail === 0) {
      actionsRef.current[direction]?.();
    }
  };

  return (
    <Layout>
      <Label>{label}</Label>

      <CountButtonLayout>
        <CountButton
          type="button"
          aria-label={`Reduser ${label}`}
          onPointerDown={(e) => handlePointerDown(e, "decrement")}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onLostPointerCapture={endHold}
          onClick={(e) => handleClick(e, "decrement")}
          onContextMenu={(e) => e.preventDefault()}
        >
          −
        </CountButton>

        <Input type="number" {...props} />

        <CountButton
          type="button"
          aria-label={`Øk ${label}`}
          onPointerDown={(e) => handlePointerDown(e, "increment")}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onLostPointerCapture={endHold}
          onClick={(e) => handleClick(e, "increment")}
          onContextMenu={(e) => e.preventDefault()}
        >
          +
        </CountButton>
      </CountButtonLayout>
    </Layout>
  );
};
