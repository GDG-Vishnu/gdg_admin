import Image, { StaticImageData } from "next/image";
import {
  isImageFitCover,
  isImageSlide,
  RenderSlideProps,
  Slide,
} from "yet-another-react-lightbox";

function isNextJsImage(slide: Slide): slide is Slide & { image: string | StaticImageData } {
  return isImageSlide(slide) && typeof slide.src === "string";
}

export default function NextJsImage({ slide, offset, rect }: RenderSlideProps) {
  if (!isNextJsImage(slide)) return null;

  const width = !rect.width ? rect.width: Math.min(rect.width, (slide.width || rect.width));
  const height = !rect.height ? rect.height : Math.min(rect.height, (slide.height || rect.height));

  return (
    <div style={{ position: "relative", width, height }}>
      <Image
        fill
        alt=""
        src={slide.src}
        loading="eager"
        draggable={false}
        style={{
          objectFit: isImageFitCover(slide, rect as any) ? "cover" : "contain",
        }}
        sizes={`${Math.ceil((width / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 100)}vw`}
      />
    </div>
  );
}
