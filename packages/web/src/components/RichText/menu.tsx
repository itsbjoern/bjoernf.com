import { useActive, useChainedCommands, useCommands } from '@remirror/react';
import { FunctionalComponent, VNode } from 'preact';
import React from 'react';

import { ReactComponent as FormatAlignCenterIcon } from 'src/components/icons/FormatAlignCenter.svg';
import { ReactComponent as FormatAlignLeftIcon } from 'src/components/icons/FormatAlignLeft.svg';
import { ReactComponent as FormatAlignRightIcon } from 'src/components/icons/FormatAlignRight.svg';
import { ReactComponent as FormatBoldIcon } from 'src/components/icons/FormatBold.svg';
import { ReactComponent as FormatItalicIcon } from 'src/components/icons/FormatItalic.svg';
import { ReactComponent as FormatListBulletedIcon } from 'src/components/icons/FormatListBulleted.svg';
import { ReactComponent as FormatListNumberedIcon } from 'src/components/icons/FormatListNumbered.svg';
import { ReactComponent as FormatSizeIcon } from 'src/components/icons/FormatSize.svg';
import { ReactComponent as FormatUnderlinedIcon } from 'src/components/icons/FormatUnderlined.svg';
import { ReactComponent as RedoIcon } from 'src/components/icons/Redo.svg';
import { ReactComponent as StrikethroughSIcon } from 'src/components/icons/StrikethroughS.svg';
import { ReactComponent as UndoIcon } from 'src/components/icons/Undo.svg';
import Button, { ButtonGroup } from 'src/components/ui/Button';

type ToggleButtonProps = {
  type: string;
  command: string;
  param?: any;
  icon: VNode;
};

// eslint-disable-next-line no-unused-vars
const ToggleButton: FunctionalComponent<ToggleButtonProps> = ({
  type,
  command,
  param,
  icon,
  ...props
}) => {
  const { [type]: active } = useActive();
  const { [command]: chain } = useChainedCommands();

  return (
    <Button
      className="!px-2 !py-2"
      variant={active?.(param) ? 'contained' : 'text'}
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
      className="sticky top-2 z-50 flex flex-row justify-center"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="flex flex-row flex-wrap gap-3 p-2"
        style={{
          border: '0.5px solid rgba(0,0,0,0.2)',
          background: '#fff',
          borderRadius: 5,
        }}
      >
        <ButtonGroup>
          <Button className="min-w-11 w-11" onClick={() => undo()}>
            <UndoIcon />
          </Button>
          <Button className="min-w-11 w-11" onClick={() => redo()}>
            <RedoIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
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
        <ButtonGroup>
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
        <ButtonGroup>
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
        <ButtonGroup>
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
