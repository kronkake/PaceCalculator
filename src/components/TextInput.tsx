import React, { InputHTMLAttributes } from "react";
import styled from "styled-components";

const Input = styled.input`
  width: 100%;
  display: block;
  text-align: center;
  border-radius: var(--radius-sm);
  padding: 1em;
  border: 1px solid var(--color-border);
  font-size: 1.2rem;
  background: var(--color-surface-alt);
  color: var(--color-text);
  transition: outline 0.25s ease, color 0.25s ease;
  outline: 2px solid transparent;

  &::placeholder {
    color: var(--color-text-muted);
    opacity: 0.6;
  }

  &:focus {
    outline: 2px solid var(--color-focus-ring);
  }
`;

interface MaskedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mask?: string;
}

export const TextInput = ({ mask = "", ...props }: MaskedInputProps) => {
  return <Input {...props} />;
};
