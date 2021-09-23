import React, { useState } from 'react'

import { withTheme } from '@mui/styles'
import { useRemirrorContext } from '@remirror/react'

import styled from 'styled-components'

const StyledEditor = withTheme(styled.div`
  .remirror-editor {
    box-sizing: border-box;
    position: relative;
    border: none;
    line-height: 1.6em;
    width: 100%;
    min-height: 142px;
    word-break: normal;
    overflow-wrap: break-word;
    &:focus {
      outline: none;
    }
    &.ProseMirror-focused {
      .ProseMirror-menubar {
        display: none;
      }
    }
    &[contenteditable='true'] {
      box-sizing: border-box;
      white-space: pre-wrap;
      padding: 10px;
      border-radius: 5px;
      background-color: #fff;
      border: 0.5px solid rgba(0, 0, 0, 0.2);
      caret-color: ${({ theme }) => theme.palette.primary.main};

      &:hover {
        border: 1px solid ${({ theme }) => theme.palette.primary.main};
      }
      &:focus {
        padding: 9px;
        border: 2px solid ${({ theme }) => theme.palette.primary.main};
      }
    }
    &[contenteditable='false'] {
      ul,
      ol {
        text-align: left;
      }
    }
    img {
      max-width: 100%;
    }
    p em {
      letter-spacing: 1.2px;
    }
    p {
      margin: 0;
    }
    a {
      text-decoration: none !important;
      color: ${(props) => props.theme.palette.primary.main};
    }
    s > .selection {
      text-decoration: line-through;
    }

    video {
      max-width: 100%;
    }
  }
`)

const View = () => {
  const { getRootProps } = useRemirrorContext()
  const [rootProps] = useState(() => getRootProps())
  return <StyledEditor {...rootProps} />
}

export default View
