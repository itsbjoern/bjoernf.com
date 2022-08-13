import React from 'react';
import { useActive, useChainedCommands, useCommands } from '@remirror/react';
import { Button, ButtonGroup } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
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
            <UndoIcon />
          </MenuButton>
          <MenuButton onClick={() => redo()}>
            <RedoIcon />
          </MenuButton>
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="bold"
            command="toggleBold"
            icon={<FormatBoldIcon />}
          />
          <ToggleButton
            type="italic"
            command="toggleItalic"
            icon={<FormatItalicIcon />}
          />
          <ToggleButton
            type="underline"
            command="toggleUnderline"
            icon={<FormatUnderlinedIcon />}
          />
          <ToggleButton
            type="strike"
            command="toggleStrike"
            icon={<StrikethroughSIcon />}
          />
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 1 }}
            icon={<FormatSizeIcon sx={{ fontSize: 20 }} />}
          />
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 2 }}
            icon={<FormatSizeIcon sx={{ fontSize: 16 }} />}
          />
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 3 }}
            icon={<FormatSizeIcon sx={{ fontSize: 12 }} />}
          />
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="bulletList"
            command="toggleBulletList"
            icon={<FormatListBulletedIcon />}
          />
          <ToggleButton
            type="orderedList"
            command="toggleOrderedList"
            icon={<FormatListNumberedIcon />}
          />
        </ButtonGroup>
        <ButtonGroup variant="outlined">
          <ToggleButton
            type="nodeFormatting"
            command="setTextAlignment"
            param="left"
            icon={<FormatAlignLeftIcon />}
          />
          <ToggleButton
            type="nodeFormatting"
            command="setTextAlignment"
            param="center"
            icon={<FormatAlignCenterIcon />}
          />
          <ToggleButton
            type="nodeFormatting"
            command="setTextAlignment"
            param="right"
            icon={<FormatAlignRightIcon />}
          />
        </ButtonGroup>
      </Row>
    </Row>
  );
};

export default Menu;
