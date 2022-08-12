import React from 'react';
import { useActive, useChainedCommands, useCommands } from '@remirror/react';
import { Button, ButtonGroup } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  Redo,
  Undo,
  FormatListBulleted,
  FormatListNumbered,
  FormatSize,
  AlignHorizontalCenter,
  AlignHorizontalLeft,
  AlignHorizontalRight,
} from '@mui/icons-material';
import styled from '@emotion/styled';

import { Row } from 'app/components/Flex';

const MenuButton = styled(Button)`
  width: 45px;

  > svg {
    height: 20px;
  }
`;

// eslint-disable-next-line no-unused-vars
const ToggleButton = ({ type, command, param, icon, variant: _, ...props }) => {
  const { [type]: active } = useActive();
  const { [command]: chain } = useChainedCommands();

  return (
    <MenuButton
      variant={active?.(param) ? 'contained' : 'outlined'}
      onClick={() => chain(param).run()}
      {...props}
    >
      {icon}
    </MenuButton>
  );
};

const Menu = () => {
  const { undo, redo } = useCommands();

  return (
    <Row
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      justify="center"
      style={{
        position: 'sticky',
        top: 10,
        zIndex: 100,
      }}
    >
      <Row
        gap={15}
        style={{
          border: '0.5px solid rgba(0,0,0,0.2)',
          padding: 10,
          background: '#fff',
          borderRadius: 5,
        }}
        wrapping
      >
        <ButtonGroup variant="outlined">
          <MenuButton onClick={() => undo()}>
            <Undo />
          </MenuButton>
          <MenuButton onClick={() => redo()}>
            <Redo />
          </MenuButton>
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="bold"
            command="toggleBold"
            icon={<FormatBold />}
          />
          <ToggleButton
            type="italic"
            command="toggleItalic"
            icon={<FormatItalic />}
          />
          <ToggleButton
            type="underline"
            command="toggleUnderline"
            icon={<FormatUnderlined />}
          />
          <ToggleButton
            type="strike"
            command="toggleStrike"
            icon={<FormatStrikethrough />}
          />
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 1 }}
            icon={<FormatSize sx={{ fontSize: 20 }} />}
          />
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 2 }}
            icon={<FormatSize sx={{ fontSize: 16 }} />}
          />
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 3 }}
            icon={<FormatSize sx={{ fontSize: 12 }} />}
          />
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="bulletList"
            command="toggleBulletList"
            icon={<FormatListBulleted />}
          />
          <ToggleButton
            type="orderedList"
            command="toggleOrderedList"
            icon={<FormatListNumbered />}
          />
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="nodeFormatting"
            command="setTextAlignment"
            param="left"
            icon={<AlignHorizontalLeft />}
          />
          <ToggleButton
            type="nodeFormatting"
            command="setTextAlignment"
            param="center"
            icon={<AlignHorizontalCenter />}
          />
          <ToggleButton
            type="nodeFormatting"
            command="setTextAlignment"
            param="right"
            icon={<AlignHorizontalRight />}
          />
        </ButtonGroup>
      </Row>
    </Row>
  );
};

export default Menu;
