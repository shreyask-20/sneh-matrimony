"use client";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, open, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-300"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}
