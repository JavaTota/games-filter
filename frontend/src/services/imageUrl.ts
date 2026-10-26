const CROPPED_WIDTH = 600;
const CROPPED_HEIGHT = 400;

export default function getCroppedImageUrl(url: string) {
  if (!url) return "/gamemaster-logo.webp";

  const marker = "media/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return url;
  }

  const firstHalf = url.slice(0, markerIndex + marker.length);
  const secondHalf = url.slice(markerIndex + marker.length);

  return `${firstHalf}crop/${CROPPED_WIDTH}/${CROPPED_HEIGHT}/${secondHalf}`;
}
