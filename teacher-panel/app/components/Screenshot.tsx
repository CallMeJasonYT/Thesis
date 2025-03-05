"use client";
import { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

const Screenshot = () => {
  const { sendMessage, addListener, removeListener } = useWebSocket();
  const [screenshot, setScreenshot] = useState<string | null>(null);

  // Send the screenshot request when the button is clicked
  const handleScreenshotRequest = () => {
    const uuid = "4h6gi45i65g4fs87g1"; // Replace with actual UUID
    console.log(`Sending screenshot request for UUID: ${uuid}`);
    sendMessage({ type: "ScreenshotRequest", uuid });
  };

  // Listen for the screenshot response and update state
  useEffect(() => {
    const handleScreenshotResponse = (data: {
      type: string;
      imageBase64: string;
    }) => {
      if (data.type === "ScreenshotUnityResponse" && data.imageBase64) {
        setScreenshot(data.imageBase64); // Save the base64 image string
      }
    };

    addListener("ScreenshotUnityResponse", handleScreenshotResponse);

    return () => {
      removeListener("ScreenshotUnityResponse", handleScreenshotResponse);
    };
  }, [addListener, removeListener]);

  return (
    <div className="p-4">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={handleScreenshotRequest}
      >
        Request Screenshot
      </button>
      {screenshot ? (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Screenshot:</h3>
          <div className="w-full max-w-[720px] aspect-video mx-auto">
            <img
              src={`data:image/png;base64,${screenshot}`}
              alt="Screenshot"
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      ) : (
        <p className="mt-2 text-gray-500">No screenshot received yet.</p>
      )}
    </div>
  );
};

export default Screenshot;
