import React, { useState, ReactNode, useLayoutEffect } from "react";
import styled from "styled-components";

const TabsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  position: relative;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  padding: 12px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.$isActive ? "#1976d2" : "#616161")};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  position: relative;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;

  &:hover {
    background-color: ${(props) =>
      props.$isActive ? "rgba(25, 118, 210, 0.04)" : "rgba(0, 0, 0, 0.04)"};
  }

  &:focus {
    background-color: ${(props) =>
      props.$isActive ? "rgba(25, 118, 210, 0.08)" : "rgba(0, 0, 0, 0.08)"};
  }

  &:active {
    background-color: ${(props) =>
      props.$isActive ? "rgba(25, 118, 210, 0.12)" : "rgba(0, 0, 0, 0.12)"};
  }
`;

const TabIndicator = styled.div<{ $width: number; $placement: number }>`
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: #1976d2;
  transition: all 0.3s ease;
  width: ${(props) => props.$width}px;
  transform: translateX(${(props) => props.$placement}px);
`;

const TabPanel = styled.div<{ $isActive: boolean }>`
  display: ${(props) => (props.$isActive ? "block" : "none")};
  padding: 12px;
  background-color: #fff;
`;

export interface TabItem {
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActiveTab?: number;
  onTabChange?: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab = 0,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [activeTabPlacement, setActiveTabPlacement] = useState({
    width: 0,
    placement: 0,
  });
  const tabButtonRef = React.useRef<HTMLButtonElement>(null);
  const tabsListRef = React.useRef<HTMLDivElement>(null);

  const handleTabClick = (index: number) => {
    if (tabs[index].disabled) return;

    setActiveTab(index);
    onTabChange?.(index);
  };

  useLayoutEffect(() => {
    const coordinates = tabsListRef?.current
      ?.querySelector("[aria-selected='true'")
      ?.getBoundingClientRect();
    if (coordinates && tabsListRef.current) {
      const wrapperOffsetLeft =
        tabsListRef.current.getBoundingClientRect().left;

      setActiveTabPlacement({
        width: coordinates.width,
        placement: coordinates.left - wrapperOffsetLeft,
      });
    }
  }, [activeTab, tabs]);

  return (
    <TabsContainer>
      <TabsList ref={tabsListRef}>
        {tabs.map((tab, index) => (
          <TabButton
            key={index}
            $isActive={activeTab === index}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
            aria-selected={activeTab === index}
            role="tab"
            ref={tabButtonRef}
          >
            {tab.label}
          </TabButton>
        ))}
        <TabIndicator
          $width={activeTabPlacement.width}
          $placement={activeTabPlacement.placement}
        />
      </TabsList>

      {tabs.map((tab, index) => (
        <TabPanel
          key={index}
          $isActive={activeTab === index}
          role="tabpanel"
          aria-labelledby={`tab-${index}`}
        >
          {tab.content}
        </TabPanel>
      ))}
    </TabsContainer>
  );
};
