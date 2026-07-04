import React, { ReactNode, useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";

const TRANSITION_MS = 250;

const StyledDialog = styled.dialog`
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  width: min(480px, calc(100vw - 32px));
  max-height: min(85vh, 720px);
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  transition: opacity 0.25s ease, transform 0.25s ease;

  /* Scoped to [open] so the UA's display: none for closed dialogs wins. */
  &[open] {
    display: flex;
    flex-direction: column;
  }

  &[data-visible="true"] {
    opacity: 1;
    transform: none;
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &[data-visible="true"]::backdrop {
    opacity: 1;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 16px 0 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  letter-spacing: -0.01em;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--color-surface-alt);
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring);
  }
`;

const Content = styled.div`
  padding: 16px 20px 20px;
  overflow-y: auto;
`;

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Dialog = ({ open, onClose, title, children }: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Drives the transition styles separately from the native open state, so
  // both the enter and the exit transition get a frame to run in.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // The dialog mounts with its closed styles; flip them on the next
      // frame so the enter transition actually runs.
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    if (dialog.open) {
      setVisible(false);
      const timeout = setTimeout(() => dialog.close(), TRANSITION_MS);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Esc closes natively and instantly; block it and run the animated close.
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };

  // Clicks on the backdrop are dispatched with the dialog element itself as
  // the target; clicks inside land on the content.
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <StyledDialog
      ref={dialogRef}
      data-visible={visible}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <Header>
        <Title id={titleId}>{title}</Title>
        <CloseButton type="button" onClick={onClose} aria-label="Lukk">
          ×
        </CloseButton>
      </Header>
      <Content>{children}</Content>
    </StyledDialog>
  );
};
