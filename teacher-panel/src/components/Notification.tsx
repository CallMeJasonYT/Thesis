"use client";

interface NotificationProps {
  username: string;
  message: React.ReactNode;
  onDismiss: () => void;
  onInspect: () => void;
}

const Notification = ({ message, onDismiss, onInspect }: NotificationProps) => {
  return (
    <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg mt-6 mb-6">
      <div>
        <p className="text-sm text-white">{message}</p>
      </div>
      <div className="ml-2 flex flex-col items-center gap-1">
        <button
          onClick={onDismiss}
          className="bg-secondary text-white text-sm px-2 py-1 rounded-lg hover:bg-red-500 w-[75px]"
        >
          Dismiss
        </button>

        <button
          onClick={onInspect}
          className="bg-primary text-white text-sm px-2 py-1 rounded-lg hover:bg-teal-800 w-[75px]"
        >
          Inspect
        </button>
      </div>
    </div>
  );
};

export default Notification;
