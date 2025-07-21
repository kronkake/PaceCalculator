import React, { SelectHTMLAttributes } from "react";
import styled from "styled-components";

const StyledSelect = styled.select`
  width: 100%;
  display: block;
  text-align: center;
  border-radius: 5px;
  padding: 1em;
  border: 1px solid #0000006b;
  transition: border ease 0.25s;
  font-size: 1.2rem;
  background: #e8e9eb;
  transition: outline 0.25s ease, color 0.25s ease;
  outline: 2px solid transparent;
  cursor: pointer;

  &:focus {
    outline: 2px solid #6200ee;
  }

  &:hover {
    border-color: #00000080;
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
