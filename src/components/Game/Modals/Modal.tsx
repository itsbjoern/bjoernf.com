import type { set } from "astro:schema";

type ModalProps = {
  title: string;
  content: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  actions: React.ReactNode;
};

export const Modal = ({
  title,
  content,
  actions,
  open,
  setOpen,
}: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-x-2 md:inset-x-1/3 top-2 md:top-10 flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center">{title}</h2>
          <div className="flex flex-col max-h-[50vh] md:max-h-[70vh] overflow-auto">
            {content}
          </div>
          <div className="border-b border-gray-300 my-4" />
          <div className="flex gap-4 justify-end">{actions}</div>
        </div>
      </div>
    </>
  );
};
