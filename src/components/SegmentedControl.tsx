import React from "react";
import styled from "styled-components";

const Wrap = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1;
  border: none;
  padding: 10px 8px;
  min-height: 40px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  color: ${({ $active }) =>
    $active ? "var(--color-primary)" : "var(--color-text-muted)"};
  background: ${({ $active }) =>
    $active ? "var(--color-surface)" : "transparent"};
  box-shadow: ${({ $active }) => ($active ? "var(--shadow-sm)" : "none")};
  transition: background-color 0.15s ease, color 0.15s ease;

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
  }
`;

interface SegmentedControlProps<T extends string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) => (
  <Wrap role="group" aria-label={ariaLabel} className={className}>
    {options.map((option) => (
      <SegmentButton
        key={option.value}
        type="button"
        $active={value === option.value}
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </SegmentButton>
    ))}
  </Wrap>
);
