import React, { SelectHTMLAttributes } from "react";
import styled from "styled-components";

const StyledSelect = styled.select`
  width: 100%;
  display: block;
  text-align: center;
  border-radius: var(--radius-sm);
  /* Mirrors the CountInput field: same font sizes and vertical padding
     (minus the ~2px of intrinsic chrome selects add), so the select lines
     up exactly with the other inputs. */
  padding: calc(0.6em - 1px) 1em;
  border: 1px solid var(--color-border);
  font-size: 1.2rem;

  @media (max-width: 560px) {
    font-size: 1rem;
  }
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

/* Wrapping label associates the text with the select without needing ids,
   and mirrors the CountInput label styling so rows line up next to it. */
const Layout = styled.label`
  display: block;
  width: 100%;
  min-width: 0;
`;

const LabelText = styled.span`
  display: block;
  margin-bottom: 0.5em;
  font-size: 0.95rem;
  color: var(--color-text-muted);
`;

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  label?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  label,
  ...props
}) => {
  const select = (
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

  if (!label) {
    return select;
  }

  return (
    <Layout>
      <LabelText>{label}</LabelText>
      {select}
    </Layout>
  );
};
