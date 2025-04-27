"use client";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import Image from "next/image";
import { IconScreenshot } from "@tabler/icons-react";

interface ScreenshotProps {
  username: string;
}

export default function Screenshot({ username }: ScreenshotProps) {
  const { sendMessage, addListener, removeListener } = useWebSocket();
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleScreenshotRequest = () => {
    console.log(`Sending screenshot request for username: ${username}`);
    sendMessage({ type: "ScreenshotRequest", username });
  };

  useEffect(() => {
    const handleScreenshotResponse = (data: {
      type: string;
      imageBase64: string;
    }) => {
      if (data.type === "ScreenshotUnityResponse" && data.imageBase64) {
        setScreenshot(data.imageBase64);
      }
    };

    addListener("ScreenshotUnityResponse", handleScreenshotResponse);

    return () => {
      removeListener("ScreenshotUnityResponse", handleScreenshotResponse);
    };
  }, [addListener, removeListener]);

  return (
    <div className="flex flex-col gap-6">
      <button
        className="px-4 py-1 bg-primary hover:bg-tertiary font-semibold rounded-md transition-all cursor-pointer flex justify-center gap-2 items-center"
        onClick={handleScreenshotRequest}
      >
        <IconScreenshot />
        Request Screenshot
      </button>
      {screenshot ? (
        <div className="w-full max-w-[720px] xl:max-w-[900px] aspect-video mx-auto">
          <h3 className="text-xl font-semibold"> Live Screenshot:</h3>
          <Image
            width={1280}
            height={720}
            src={`data:image/png;base64,${screenshot}`}
            alt="Screenshot"
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>
      ) : (
        <p className="font-extralight text-white">
          No screenshot received yet.
        </p>
      )}
    </div>
  );
}
