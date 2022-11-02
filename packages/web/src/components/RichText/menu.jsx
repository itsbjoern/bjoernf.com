import { useActive, useChainedCommands, useCommands } from '@remirror/react';
import React from 'react';

import FormatAlignCenterIcon from 'src/components/icons/FormatAlignCenter.svg';
import FormatAlignLeftIcon from 'src/components/icons/FormatAlignLeft.svg';
import FormatAlignRightIcon from 'src/components/icons/FormatAlignRight.svg';
import FormatBoldIcon from 'src/components/icons/FormatBold.svg';
import FormatItalicIcon from 'src/components/icons/FormatItalic.svg';
import FormatListBulletedIcon from 'src/components/icons/FormatListBulleted.svg';
import FormatListNumberedIcon from 'src/components/icons/FormatListNumbered.svg';
import FormatSizeIcon from 'src/components/icons/FormatSize.svg';
import FormatUnderlinedIcon from 'src/components/icons/FormatUnderlined.svg';
import RedoIcon from 'src/components/icons/Redo.svg';
import StrikethroughSIcon from 'src/components/icons/StrikethroughS.svg';
import UndoIcon from 'src/components/icons/Undo.svg';
import Button, { ButtonGroup } from 'src/components/ui/Button';

// eslint-disable-next-line no-unused-vars
const ToggleButton = ({ type, command, param, icon, variant: _, ...props }) => {
  const { [type]: active } = useActive();
  const { [command]: chain } = useChainedCommands();

  return (
    <Button
      className="min-w-11 w-11"
      variant={active?.(param) ? 'contained' : 'outlined'}
      onClick={() => chain(param).run()}
      {...props}
    >
      {icon}
    </Button>
  );
};

const Menu = () => {
  const { undo, redo } = useCommands();

  return (
    <div
      className="flex flex-row"
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
      <div
        className="flex flex-row flex-wrap gap-3 p-10"
        style={{
          border: '0.5px solid rgba(0,0,0,0.2)',
          background: '#fff',
          borderRadius: 5,
        }}
      >
        <ButtonGroup variant="outlined">
          <Button className="min-w-11 w-11" onClick={() => undo()}>
            <UndoIcon />
          </Button>
          <Button className="min-w-11 w-11" onClick={() => redo()}>
            <RedoIcon />
          </Button>
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
            icon={<FormatSizeIcon />}
          />
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 2 }}
            icon={<FormatSizeIcon />}
          />
          <ToggleButton
            type="heading"
            command="toggleHeading"
            param={{ level: 3 }}
            icon={<FormatSizeIcon />}
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
      </div>
    </div>
  );
};

export default Menu;