import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toast';

import Clear from 'src/components/icons/Clear.svg';
import UploadIcon from 'src/components/icons/Upload.svg';
import { IconButton } from 'src/components/ui/Button';
import CircularProgress from 'src/components/ui/CircularProgress';
import { useDialog } from 'src/components/ui/Dialog';

import * as classes from './styles.module.scss';

const PostImage = ({
  src,
  editable,
  onImageChosen,
  onImageCleared,
  size = 150,
}) => {
  const [isUploading, setIsUploading] = useState(false);
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
      onImageChosen(file, { max_size: 300, quality: 80 }).then(() => {
        setIsUploading(false);
      });
    },
    [onImageChosen]
  );

  return (
    <>
      <ClearDialog />
      <div
        className={`${classes.postImageContainer} ${
          !isUploading && editable ? classes.editableImage : ''
        } ${src ? classes.hasSrc : ''}`}
        style={{
          minWidth: size,
          width: size,
          minHeight: size,
          height: size,
        }}
        onClick={() => {
          if (!editable) return;
          if (!uploadRef.current) return;

          uploadRef.current.click();
        }}
        onDragOver={(ev) => {
          ev.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!editable) return;
          if (event.dataTransfer?.items?.length !== 1) {
            toast.error('A single file is required.');
            return;
          }
          if (event.dataTransfer.items[0].kind !== 'file') {
            toast.error('File required.');
            return;
          }
          const file = event.dataTransfer.items[0].getAsFile();
          if (!file.type.startsWith('image/')) {
            toast.error('Image file required.');
            return;
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
                  toast.error('Image file required.');
                }
                const file = files[0];
                onFileChosen(file);
                event.currentTarget.value = '';
              }}
            />
            <UploadIcon className="upload-icon" />
            {src ? (
              <div
                className="absolute -left-[14px] -top-[14px] z-[3] rounded-full bg-paper p-1 hover:cursor-pointer [&>.MuiButtonBase-root]:h-[35px] [&>.MuiButtonBase-root]:w-[35px]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openClearDialog();
                }}
              >
                <IconButton>
                  <Clear />
                </IconButton>
              </div>
            ) : null}
          </>
        ) : null}
        {src ? <img src={src} /> : null}
        {isUploading ? (
          <CircularProgress
            className="absolute text-[rgba(0,0,0,0.54)]"
            size={50}
          />
        ) : null}
      </div>
    </>
  );
};

export default PostImage;
