import styled from "styled-components";

export const DistanceList = styled.ol`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7.5px;
`;

export const DistanceListItem = styled.li`
  padding: 12px;
  background-color: var(--color-surface-alt);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  border-left: 4px solid var(--color-primary);
  transition: background-color 0.25s ease;
`;
