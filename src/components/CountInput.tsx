import React, { InputHTMLAttributes, useCallback, useRef } from "react";
import styled from "styled-components";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CountButtonLayout = styled.div`
  display: flex;
  align-items: stretch;
  border-radius: 1rem;
  overflow: hidden;
  transition: outline 0.25s ease;
  outline: 2px solid transparent;
  &:focus-within {
    outline: 2px solid #6200ee;
  }
`;

const Input = styled.input`
  width: 100%;
  display: block;
  text-align: center;
  border: 1px solid transparent;
  font-size: 1.2rem;
  background: #e8e9eb;
  transition: outline 0.25s ease, color 0.25s ease;
  outline: 2px solid transparent;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5em;
  font-size: 1rem;
  color: #333;
`;

const CountButton = styled.button`
  display: block;
  border: none;
  padding: 0.5em 0.5em;
  font-size: 1.6rem;
  font-weight: 500;
  cursor: pointer;
  background: #e8e9eb;
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const CountInput = ({
  label,
  onIncrement,
  onDecrement,
  ...props
}: InputProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  const initialDelayMS = 300;

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isHoldingRef.current = false;
  };

  const startContinuousAction = (action?: () => void) => {
    if (!action) {
      return;
    }
    // First click - immediate action
    action();
    isHoldingRef.current = true;

    // Start continuous action after initial delay
    timeoutRef.current = setTimeout(() => {
      if (!isHoldingRef.current) return;

      let currentDelay = 200; // Start with 200ms interval
      const minDelay = 50; // Fastest interval (50ms)
      const acceleration = 0.9; // Speed up factor

      const continuousAction = () => {
        if (!isHoldingRef.current) return;
        action();

        // Speed up the interval
        currentDelay = Math.max(minDelay, currentDelay * acceleration);

        intervalRef.current = setTimeout(continuousAction, currentDelay);
      };

      continuousAction();
    }, initialDelayMS); // Initial delay before continuous action starts
  };

  return (
    <Layout>
      <Label>{label}</Label>

      <CountButtonLayout>
        <CountButton
          type="button"
          onMouseDown={() => startContinuousAction(onDecrement)}
          onMouseUp={clearTimers}
          onMouseLeave={clearTimers}
          onTouchStart={() => startContinuousAction(onDecrement)}
          onTouchEnd={clearTimers}
        >
          -
        </CountButton>

        <Input type="number" {...props} />

        <CountButton
          type="button"
          onMouseDown={() => startContinuousAction(onIncrement)}
          onMouseUp={clearTimers}
          onMouseLeave={clearTimers}
          onTouchStart={() => startContinuousAction(onIncrement)}
          onTouchEnd={clearTimers}
        >
          +
        </CountButton>
      </CountButtonLayout>
    </Layout>
  );
};
