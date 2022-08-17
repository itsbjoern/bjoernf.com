import styled from '@emotion/styled';

const StyledEditor = styled.div`
  .remirror-editor {
    box-sizing: border-box;
    position: relative;
    box-shadow: none;
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

    *:not(pre) > code {
      font-size: 0.97rem;
      background-color: hsl(202deg 26% 80% / 39%);
      padding: 1px 3px;
      border-radius: 4px;
    }

    pre {
      margin: 8px 0;
      tab-size: 2;
      padding: 10px 15px;
      display: block;
      max-width: 100%;
      overflow: auto;
      line-height: 1.2em;

      border-radius: 8px;
      background: #f2f2f2;
      box-shadow: inset 6px 6px 12px #d5d5d5, inset -6px -6px 12px #ffffff;
      code {
        font-size: 0.95rem;
        color: #444;
      }
    }

    &[contenteditable='true'] {
      box-sizing: border-box;
      white-space: pre-wrap;
      padding: 10px;
      border-radius: 5px;
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.2);
      caret-color: ${({ theme }) => theme.palette.primary.main};

      &:hover {
        border: 1px solid #3f403f;
      }
      &:focus {
        padding: 9px;
        border: 2px solid ${({ theme }) => theme.palette.primary.main};
        box-shadow: none;
      }
    }

    ul,
    ol {
      text-align: left;
    }

    ul {
      padding-inline-start: 30px;
    }

    ol {
      list-style-position: inside;
      padding-inline-start: 7px;

      p {
        display: inline;
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
    p:empty {
      margin: 1.6em 0;
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
`;

export default StyledEditor;
