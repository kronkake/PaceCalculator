import React, { SelectHTMLAttributes } from "react";
import styled from "styled-components";

const StyledSelect = styled.select`
  width: 100%;
  display: block;
  text-align: center;
  border-radius: var(--radius-sm);
  padding: 1em;
  border: 1px solid var(--color-border);
  font-size: 1.2rem;
  background: var(--color-surface-alt);
  color: var(--color-text);
  transition: outline 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  outline: 2px solid transparent;
  cursor: pointer;

  &:focus {
    outline: 2px solid var(--color-focus-ring);
  }

  &:hover {
    border-color: var(--color-text-muted);
  }
`;

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, placeholder, ...props }) => {
  return (
    <StyledSelect {...props}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
};
