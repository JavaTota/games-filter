import noImage from "../assets/no-image-placeholder-6f3882e0.webp";

/** RAWG supports image transforms in the URL; requesting a crop reduces card payload size. */
const getCroppedImageUrl = (url: string) => {
  if (!url) return noImage;

  const marker = "media/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return url;

  const insertAt = markerIndex + marker.length;
  return `${url.slice(0, insertAt)}crop/600/400/${url.slice(insertAt)}`;
};

export default getCroppedImageUrl;
