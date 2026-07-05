import React from "react";
import styled, { css } from "styled-components";
import { ChevronRightIcon } from "../icons/ChevronRight";

export const DistanceList = styled.ol`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7.5px;
`;

const rowStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 48px;
  padding: 10px 12px;
  background-color: var(--color-surface-alt);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--color-primary);
`;

export const DistanceListItem = styled.li<{ $highlighted?: boolean }>`
  ${rowStyles}
  transition: background-color 0.25s ease;

  ${({ $highlighted }) =>
    $highlighted &&
    css`
      background-color: var(--color-primary-soft);
      font-weight: 600;
    `}
`;

// Left-hand side of a row; shrinks and truncates before the value does.
export const RowLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

// Right-aligned figure; tabular digits keep times in a column aligned.
export const RowValue = styled.span`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
`;

const ChevronBubble = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  /* Absorb the bubble's extra height so rows with and without a chevron
     stay the same height. */
  margin: -3px 0;
  border-radius: 50%;
  color: var(--color-primary);
  background: var(--color-primary-soft);
`;

export const Chevron = () => (
  <ChevronBubble aria-hidden="true">
    <ChevronRightIcon size={14} />
  </ChevronBubble>
);

// A pressable row with the same look as DistanceListItem; wrap it in a bare
// <li> to keep the list semantics valid.
export const DistanceListItemButton = styled.button`
  ${rowStyles}
  width: 100%;
  font-family: inherit;
  font-size: 1rem;
  text-align: left;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:not(:disabled) {
    cursor: pointer;
  }

  &:disabled {
    color: var(--color-text-muted);
    border-left-color: var(--color-border);
  }

  /* Hover only on devices that actually hover, so touch taps don't leave
     a stuck hover state behind. */
  @media (hover: hover) {
    &:hover:not(:disabled) {
      background-color: var(--color-surface-alt-hover);
    }
  }

  &:active:not(:disabled) {
    background-color: var(--color-surface-alt-active);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 1px;
  }
`;
