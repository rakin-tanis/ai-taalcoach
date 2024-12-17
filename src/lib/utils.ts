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


// Utility function to convert image to base64
export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

