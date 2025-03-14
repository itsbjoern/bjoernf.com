import { Modal } from "./Modal";

type RulesModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const RulesModal = ({ open, setOpen }: RulesModalProps) => {
  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title="How to Play"
      content={
        <>
          <p className="mt-4 text-center">
            Every day you will be shown a random page of a Wikipedia entry. For
            each page, it gives you a list of pages that it links to. Then it
            shows the page that the last page links to, and that one links to
            another page, and so on.
          </p>
          <p className="mt-4 text-center">
            Your goal is to navigate from the start page to the end page by
            correctly identifying the links between the pages that lead you to
            the correct ending page. You can use the questionmark to learn more
            about a page. To not spoil the game for yourself, don't use the
            Wikipedia link unless you absolutely have to.
          </p>
          <p className="mt-4 text-center">
            When you have made a selection for all links, press the "Check"
            button to see if you have made the correct choices.
          </p>
        </>
      }
      actions={
        <>
          <button
            className="p-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </button>
        </>
      }
    />
  );
};
