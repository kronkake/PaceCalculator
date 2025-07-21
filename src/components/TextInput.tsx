import React, { InputHTMLAttributes } from "react";
import styled from "styled-components";

const Input = styled.input`
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
  &:focus {
    outline: 2px solid #6200ee;
  }
`;

interface MaskedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mask?: string;
}

export const TextInput = ({ mask = "", ...props }: MaskedInputProps) => {
  return <Input {...props} />;
};
