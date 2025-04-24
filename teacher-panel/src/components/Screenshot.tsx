"use client";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const Screenshot = () => {
  const { sendMessage, addListener, removeListener } = useWebSocket();
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const handleScreenshotRequest = () => {
    if (!username) {
      console.error("Username is missing from URL parameters!");
      return;
    }

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
    <div>
      <button
        className="px-4 py-2 bg-quaternary hover:bg-tertiary font-bold rounded-md transition-all"
        onClick={handleScreenshotRequest}
        disabled={!username}
      >
        Request Screenshot
      </button>
      {screenshot ? (
        <div className="mt-4">
          <h3 className="text-xl font-semibold"> Live Screenshot:</h3>
          <div className="mt-2 w-full max-w-[720px] xl:max-w-[900px] aspect-video mx-auto">
            <Image
              width={1280}
              height={720}
              src={`data:image/png;base64,${screenshot}`}
              alt="Screenshot"
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      ) : (
        <p className="mt-2 font-extralight text-white">
          No screenshot received yet.
        </p>
      )}
    </div>
  );
};

export default Screenshot;
