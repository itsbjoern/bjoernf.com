import { pencilLine, IconTree } from '@remirror/icons';
// https://remixicon.com/
import { checkLine, closeLine, deleteBinLine } from '@remirror/icons/all';
import {
  FloatingWrapper,
  useAttrs,
  useChainedCommands,
  useCurrentSelection,
  useExtension,
  useUpdateReason,
} from '@remirror/react';
import React, { FunctionComponent, useEffect, useLayoutEffect, useState } from 'react';
import { LinkExtension, ShortcutHandlerProps } from 'remirror/extensions';

import Button from '../ui/Button';

const RemirrorIcon: FunctionComponent<{
  icon: IconTree[];
}> = ({ icon }) => (
  <svg>
    {icon.map(({ tag: Tag, attr }) => (
      <Tag key={`${Tag}-${attr}`} {...attr} />
    ))}
  </svg>
);

const BetterLinkHandler = () => {
  const [linkShortcut, setLinkShortcut] = useState<ShortcutHandlerProps>();
  const [isEditing, setIsEditing] = useState(false);
  const [inputIsFocused, setInputFocused] = useState(false);
  const selection = useCurrentSelection();
  const chain = useChainedCommands();

  // Receive and maintain the current url state
  const url = (useAttrs().link()?.href as string) ?? '';
  const hasUrl = url !== '';
  const [href, setHref] = useState(url);
  useEffect(() => {
    setHref(url);
  }, [url]);

  useExtension(
    LinkExtension,
    ({ addHandler }) =>
      addHandler('onShortcut', (props) => {
        if (!isEditing) {
          setIsEditing(true);
        }
        return setLinkShortcut(props);
      }),
    [isEditing]
  );

  const createOrUpdateLink = () => {
    setIsEditing(false);
    const range = linkShortcut ?? undefined;

    if (href === '') {
      chain.removeLink();
    } else {
      chain.updateLink({ href, auto: false }, range);
    }

    chain.focus(range?.to ?? selection.to).run();
  };

  const removeLink = () => {
    chain.removeLink().focus().run();
  };

  const updateReason = useUpdateReason();
  useLayoutEffect(() => {
    if (isEditing || hasUrl) {
      return;
    }
    if (updateReason.doc || updateReason.selection) {
      setIsEditing(false);
      setHref('');
    }
  }, [isEditing, hasUrl, updateReason.doc, updateReason.selection]);

  const inputIsDisabled = hasUrl && !isEditing;
  return (
    <>
      <FloatingWrapper
        positioner="always"
        placement="bottom-start"
        enabled={isEditing || !selection.empty || hasUrl}
        renderOutsideEditor
      >
        {inputIsFocused ? (
          <div className="relative -top-[39px] -left-[1px]">
            <div
              className="absolute top-0 left-0  h-7 w-2 bg-blue-300 opacity-75"
              style={{ width: Math.abs(selection.to - selection.from) * 8 }}
            />
          </div>
        ) : null}
        <div className="relative -top-2 flex flex-row items-center gap-2">
          <input
            disabled={inputIsDisabled}
            className={`box-border h-7 rounded-md bg-paper px-2 py-0 text-sm outline ${
              inputIsDisabled
                ? 'outline-slate-200'
                : 'outline-primary hover:outline-2 focus:outline-2'
            }`}
            autoFocus
            placeholder="Enter link..."
            onChange={(event) => setHref(event.currentTarget.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            value={href}
            onKeyPress={(event) => {
              if (inputIsDisabled) {
                return;
              }
              const { code } = event;

              if (code === 'Enter') {
                createOrUpdateLink();
              }
            }}
          />
          {inputIsDisabled ? (
            <div className="flex flex-row gap-1">
              <Button onClick={() => setIsEditing(true)}>
                <RemirrorIcon icon={pencilLine} />
              </Button>
              <Button
                onClick={() => {
                  removeLink();
                  setIsEditing(false);
                }}
              >
                <RemirrorIcon icon={deleteBinLine} />
              </Button>
            </div>
          ) : (
            <div className="flex flex-row gap-1">
              <Button
                onClick={() => {
                  createOrUpdateLink();
                  setIsEditing(false);
                }}
              >
                <RemirrorIcon icon={checkLine} />
              </Button>
              {url ? (
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setHref(url);
                  }}
                >
                  <RemirrorIcon icon={closeLine} />
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </FloatingWrapper>
    </>
  );
};

export default BetterLinkHandler;
