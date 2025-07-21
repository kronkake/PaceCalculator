import React, { InputHTMLAttributes } from "react";
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
  return (
    <Layout>
      <Label>{label}</Label>

      <CountButtonLayout>
        <CountButton type="button" onClick={onDecrement}>
          -
        </CountButton>

        <Input type="number" {...props} />

        <CountButton type="button" onClick={onIncrement}>
          +
        </CountButton>
      </CountButtonLayout>
    </Layout>
  );
};
