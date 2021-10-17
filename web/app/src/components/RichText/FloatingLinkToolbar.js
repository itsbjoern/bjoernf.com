import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { createMarkPositioner, LinkExtension } from 'remirror/extensions'
import {
  ComponentItem,
  FloatingToolbar,
  FloatingWrapper,
  useActive,
  useAttrs,
  useChainedCommands,
  useCurrentSelection,
  useExtension,
  useUpdateReason,
} from '@remirror/react'
import styled from '@emotion/styled'

function useLinkShortcut() {
  const [linkShortcut, setLinkShortcut] = useState()
  const [isEditing, setIsEditing] = useState(false)

  useExtension(
    LinkExtension,
    ({ addHandler }) =>
      addHandler('onShortcut', (props) => {
        if (!isEditing) {
          setIsEditing(true)
        }

        return setLinkShortcut(props)
      }),
    [isEditing]
  )

  return { linkShortcut, isEditing, setIsEditing }
}

function useFloatingLinkState() {
  const chain = useChainedCommands()
  const { isEditing, linkShortcut, setIsEditing } = useLinkShortcut()
  const { to, empty } = useCurrentSelection()

  const url = useAttrs().link()?.href ?? ''
  const [href, setHref] = useState(url)

  // A positioner which only shows for links.
  const linkPositioner = useMemo(
    () => createMarkPositioner({ type: 'link' }),
    []
  )

  const onRemove = useCallback(() => {
    return chain.removeLink().focus().run()
  }, [chain])

  const updateReason = useUpdateReason()

  useLayoutEffect(() => {
    if (!isEditing) {
      return
    }

    if (updateReason.doc || updateReason.selection) {
      setIsEditing(false)
    }
  }, [isEditing, setIsEditing, updateReason.doc, updateReason.selection])

  useEffect(() => {
    setHref(url)
  }, [url])

  const submitHref = useCallback(() => {
    setIsEditing(false)
    const range = linkShortcut ?? undefined

    if (href === '') {
      chain.removeLink()
    } else {
      chain.updateLink({ href, auto: false }, range)
    }

    chain.focus(range?.to ?? to).run()
  }, [setIsEditing, linkShortcut, chain, href, to])

  const cancelHref = useCallback(() => {
    setIsEditing(false)
  }, [setIsEditing])

  const clickEdit = useCallback(() => {
    if (empty) {
      chain.selectLink()
    }

    setIsEditing(true)
  }, [chain, empty, setIsEditing])

  return useMemo(
    () => ({
      href,
      setHref,
      linkShortcut,
      linkPositioner,
      isEditing,
      clickEdit,
      onRemove,
      submitHref,
      cancelHref,
    }),
    [
      href,
      linkShortcut,
      linkPositioner,
      isEditing,
      clickEdit,
      onRemove,
      submitHref,
      cancelHref,
    ]
  )
}

const FloatingLinkToolbar = () => {
  const {
    isEditing,
    linkPositioner,
    clickEdit,
    onRemove,
    submitHref,
    href,
    setHref,
    cancelHref,
  } = useFloatingLinkState()
  const active = useActive()
  const activeLink = active.link()
  const { empty } = useCurrentSelection()
  const linkEditItems = useMemo(
    () => [
      {
        type: ComponentItem.ToolbarGroup,
        label: 'Link',
        items: activeLink
          ? [
              {
                type: ComponentItem.ToolbarButton,
                onClick: () => clickEdit(),
                icon: 'pencilLine',
              },
              {
                type: ComponentItem.ToolbarButton,
                onClick: onRemove,
                icon: 'linkUnlink',
              },
            ]
          : [
              {
                type: ComponentItem.ToolbarButton,
                onClick: () => clickEdit(),
                icon: 'link',
              },
            ],
      },
    ],
    [clickEdit, onRemove, activeLink]
  )

  const items = useMemo(() => linkEditItems, [linkEditItems])

  return (
    <>
      <FloatingToolbar
        items={items}
        positioner="selection"
        placement="top"
        enabled={!isEditing}
      />
      <FloatingToolbar
        items={linkEditItems}
        positioner={linkPositioner}
        placement="bottom"
        enabled={!isEditing && empty}
      />

      <FloatingWrapper
        positioner="always"
        placement="bottom"
        enabled={isEditing}
        renderOutsideEditor
      >
        <input
          style={{ zIndex: 20 }}
          autoFocus
          placeholder="Enter link..."
          onChange={(event) => setHref(event.target.value)}
          value={href}
          onKeyPress={(event) => {
            const { code } = event

            if (code === 'Enter') {
              submitHref()
            }

            if (code === 'Escape') {
              cancelHref()
            }
          }}
        />
      </FloatingWrapper>
    </>
  )
}

export default FloatingLinkToolbar
