import type { Link } from "../util";
import { Modal } from "./Modal";

type LinkModalProps = {
  link: Link | null;
  setLink: (link: Link | null) => void;
};

export const LinkModal = ({ link, setLink }: LinkModalProps) => {
  if (!link) {
    return null;
  }
  const { title, summary, url, image } = link;

  return (
    <Modal
      title={title}
      open={true}
      setOpen={() => setLink(null)}
      content={
        <div className="p-6 bg-white rounded-lg shadow-lg">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-16 h-16 md:w-32 md:h-32 mx-auto rounded-lg object-cover"
            />
          )}
          <p className="mt-4 text-center">{summary}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-center text-blue-500 underline"
          >
            Read more on Wikipedia
          </a>
        </div>
      }
      actions={
        <button
          className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
          onClick={() => {
            setLink(null);
          }}
        >
          Close
        </button>
      }
    />
  );
};
