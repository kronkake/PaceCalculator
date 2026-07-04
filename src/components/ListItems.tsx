import styled, { css } from "styled-components";

export const DistanceList = styled.ol`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7.5px;
`;

export const DistanceListItem = styled.li<{ $highlighted?: boolean }>`
  padding: 12px;
  background-color: var(--color-surface-alt);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--color-primary);
  transition: background-color 0.25s ease;

  ${({ $highlighted }) =>
    $highlighted &&
    css`
      background-color: var(--color-primary-soft);
      font-weight: 600;
    `}
`;

export const Chevron = styled.span`
  color: var(--color-text-muted);
`;

// A pressable row with the same look as DistanceListItem; wrap it in a bare
// <li> to keep the list semantics valid.
export const DistanceListItemButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  font-family: inherit;
  font-size: 1rem;
  text-align: left;
  background-color: var(--color-surface-alt);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--color-primary);
  transition: background-color 0.15s ease;

  &:not(:disabled) {
    cursor: pointer;
  }

  &:hover:not(:disabled) {
    background-color: var(--color-surface-alt-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
  }
`;
