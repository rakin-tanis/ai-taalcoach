import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkIsMobile(userAgent?: string): boolean {
  // Check if running on the server
  if (typeof window === "undefined") {
    // Server-side detection using user agent
    const serverUserAgent = userAgent || "";
    const isMobileDeviceServer =
      /android|bb\d+|meego|avantgo|bada|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|iphone|ipod|kindle|lge|maemo|midp|mobile|palm|phone|pocket|psp|symbian|windows ce|xda|xiino/i.test(
        serverUserAgent
      );
    return isMobileDeviceServer;
  }

  // Client-side detection
  const mobileCheck = () => {
    const clientUserAgent = navigator.userAgent || "";
    const isMobileDevice =
      /android|bb\d+|meego|avantgo|bada|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|iphone|ipod|kindle|lge|maemo|midp|mobile|palm|phone|pocket|psp|symbian|windows ce|xda|xiino/i.test(
        clientUserAgent
      );
    return isMobileDevice;
  };

  return window.innerWidth <= 768 || mobileCheck();
}
