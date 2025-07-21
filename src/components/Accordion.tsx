import React, { useState } from "react";
import styled from "styled-components";

type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

const AccordionElement = styled.div`
    border-bottom: "1px solid #ccc", 
    margin-bottom: 8
`;

const Button = styled.button`
    width: 100%
    text-align: left
    padding: 8px
    background: #f7f7f7
    border: none
    cursor: pointer
    font-weight: bold
`;

const AccordionContent = styled.div`
  padding: 8px;
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
`;

export const Accordion = (items: AccordionItem[]) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {items.map((item, idx) => (
        <AccordionElement key={idx}>
          <Button onClick={() => handleToggle(idx)}>{item.title}</Button>
          {openIndex === idx && <AccordionContent>{item.content}</AccordionContent>}
        </AccordionElement>
      ))}
    </div>
  );
};
