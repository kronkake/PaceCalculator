import React from "react";
import styled from "styled-components";
import { PaceCalculator } from "./views/PaceCalculator";

const Main = styled.main`
  background: white;
  font-size: 1.5rem;
`;

const FieldSet = styled.fieldset`
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;

function App() {
  return (
    <>
      <Main>
        <FieldSet>
          <PaceCalculator />
        </FieldSet>
      </Main>
    </>
  );
}

export default App;
