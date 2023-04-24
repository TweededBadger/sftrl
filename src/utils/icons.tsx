
import ReactDOMServer from "react-dom/server";
import ReactDOM from "react-dom";

import * as htmlToImage from "html-to-image";
import { ComponentType } from "react";

import { FaStar } from "react-icons/fa";
import { createRoot } from "react-dom/client";

export async function createOffScreenIcon(
  iconComponent: React.ReactElement
): Promise<HTMLImageElement> {
  const svgString = ReactDOMServer.renderToString(iconComponent);
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

  const iconImage = new Image();

  // Wait for the image to load before returning it
  await new Promise((resolve, reject) => {
    iconImage.onload = () => resolve(iconImage);
    iconImage.onerror = (error) => reject(error);
    iconImage.src = dataUrl;
  });

  return iconImage;
}
