import React, { useState, ReactNode, useLayoutEffect } from "react";
import styled from "styled-components";

const TabsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
  position: relative;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  padding: 12px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "var(--color-text-muted)"};
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
    background-color: var(--color-primary-softer);
  }

  &:focus {
    background-color: var(--color-primary-soft);
  }

  &:active {
    background-color: var(--color-primary-soft);
  }
`;

const TabIndicator = styled.div<{ $width: number; $placement: number }>`
  position: absolute;
  bottom: 0;
  height: 2px;
  background-color: var(--color-primary);
  transition: all 0.3s ease;
  width: ${(props) => props.$width}px;
  transform: translateX(${(props) => props.$placement}px);
`;

const TabPanel = styled.div<{ $isActive: boolean }>`
  display: ${(props) => (props.$isActive ? "flex" : "none")};
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 12px;
  background-color: var(--color-surface);
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
    const measure = () => {
      const coordinates = tabsListRef?.current
        ?.querySelector("[aria-selected='true']")
        ?.getBoundingClientRect();
      if (coordinates && tabsListRef.current) {
        const wrapperOffsetLeft =
          tabsListRef.current.getBoundingClientRect().left;

        setActiveTabPlacement({
          width: coordinates.width,
          placement: coordinates.left - wrapperOffsetLeft,
        });
      }
    };

    measure();

    // Re-measure when the list changes size — e.g. on window resize, or
    // when the tabs sit in a dialog that only becomes visible after mount.
    const observer = new ResizeObserver(measure);
    if (tabsListRef.current) {
      observer.observe(tabsListRef.current);
    }
    return () => observer.disconnect();
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
