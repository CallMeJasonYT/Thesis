import React from "react";

const notificationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      d="M20 18H4l2-2V10a6 6 0 0 1 5-5.91V3a1 1 0 0 1 2 0V4.09a5.9 5.9 0 0 1 1.3.4A3.992 3.992 0 0 0 18 
    10v6Zm-8 4a2 2 0 0 0 2-2H10A2 2 0 0 0 12 22ZM18 4a2 2 0 1 0 2 2A2 2 0 0 0 18 4Z"
    />
  </svg>
);

export default notificationIcon;
