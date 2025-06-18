"use client";

interface NotificationProps {
  message: string;
  onDismiss: () => void;
  onInspect: () => void;
}

const Notification = ({ message, onDismiss, onInspect }: NotificationProps) => {
  return (
    <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg mt-6 mb-6">
      <div>
        <p className="text-sm ">{message}</p>
      </div>
      <div className="ml-2 flex flex-col items-center gap-1">
        <button
          onClick={onDismiss}
          className="bg-secondary  text-sm px-2 py-1 rounded-lg hover:bg-red-500 w-[75px] cursor-pointer"
        >
          Dismiss
        </button>

        <button
          onClick={onInspect}
          className="bg-primary  text-sm px-2 py-1 rounded-lg hover:bg-teal-800 w-[75px] cursor-pointer"
        >
          Inspect
        </button>
      </div>
    </div>
  );
};

export default Notification;
