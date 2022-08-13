import React, { useState, useCallback, useRef } from 'react';
import { CircularProgress, IconButton } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import Clear from '@mui/icons-material/Clear';
import styled from '@emotion/styled';

import { useNotification } from 'app/providers/NotificationProvider';
import { useDialog } from 'app/components/Dialog';

const ClearButton = styled.div`
  position: absolute;
  left: -14px;
  top: -14px;
  border-radius: 20px;
  background-color: #f1f1f1;

  padding: 4px;
  z-index: 3;

  > .MuiButtonBase-root {
    width: 35px;
    height: 35px;
  }

  &:hover {
    cursor: pointer;
  }
`;

const PostImageContainer = styled.div`
  position: relative;
  display: flex;

  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  padding: 3px;

  align-items: center;
  justify-content: center;

  ${({ size }) => `
    min-width: ${size}px;
    width: ${size}px;
    min-height: ${size}px;
    height: ${size}px;
  `}

  @media only screen and (max-width: 425px) {
    min-width: 75px;
    width: 75px;
    min-height: 75px;
    height: 75px;
  }

  ${({ editable, imgSrc }) =>
    editable &&
    `
    &:hover {
      border-color: #3f403f;
      cursor: pointer;

      > img {
        filter: grayscale(1);
      }

      > svg {
        color: #3f403f;
      }

      &&> .MuiSvgIcon-root {
        display: block;
        z-index: 2;
      }
    }

    &> .MuiSvgIcon-root {
      display: ${imgSrc ? 'none' : 'block'};
    }
  `}

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  > .MuiSvgIcon-root {
    position: absolute;
    font-size: 50px;
    color: rgba(0, 0, 0, 0.54);
    display: none;
  }

  > .MuiCircularProgress-root {
    position: absolute;
    color: rgba(0, 0, 0, 0.54);
  }
`;

const PostImage = ({
  src,
  editable,
  onImageChosen,
  onImageCleared,
  size = 150,
  hideOnMobile,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { createNotification } = useNotification();

  const [ClearDialog, openClearDialog] = useDialog(
    'Are you sure you want to clear this image?',
    onImageCleared
  );

  const uploadRef = useRef();
  if (!editable && !src) {
    return null;
  }

  const onFileChosen = useCallback(
    (file) => {
      setIsUploading(true);
      onImageChosen(file).then(() => {
        setIsUploading(false);
      });
    },
    [onImageChosen]
  );

  return (
    <>
      <ClearDialog />
      <PostImageContainer
        size={size}
        imgSrc={src}
        editable={!isUploading && editable}
        isUploading={isUploading}
        hideOnMobile={hideOnMobile}
        onClick={() => {
          if (!editable) return;
          if (!uploadRef.current) return;

          uploadRef.current.click();
        }}
        onDrop={(event) => {
          if (!editable) return;
          if (event.datatTransfer?.items?.length !== 1) {
            createNotification('A single file is required.');
          }
          if (event.dataTransfer.items[0].kind !== 'file') {
            createNotification('File required.');
          }
          const file = event.dataTransfer.items[0].getAsFile();
          if (!file.type.startsWith('image/')) {
            createNotification('Image file required.');
          }

          onFileChosen(file);
        }}
      >
        {editable ? (
          <>
            <input
              ref={uploadRef}
              accept="image/*"
              type="file"
              style={{ display: 'none' }}
              onChange={(event) => {
                const files = event.target.files;
                if (files.length !== 1) {
                  createNotification('Image file required.');
                }
                const file = files[0];
                onFileChosen(file);
                event.currentTarget.value = '';
              }}
            />
            <UploadIcon />
            {src ? (
              <ClearButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openClearDialog();
                }}
              >
                <IconButton>
                  <Clear />
                </IconButton>
              </ClearButton>
            ) : null}
          </>
        ) : null}
        {src ? <img src={src} /> : null}
        {isUploading ? <CircularProgress size={50} /> : null}
      </PostImageContainer>
    </>
  );
};

export default PostImage;
