import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

type RecipeImageGalleryProps = {
  images: string[];
  title: string;
  className?: string;
  placeholderClassName?: string;
};

export function RecipeImageGallery({
  images,
  title,
  className = "aspect-16/7 overflow-hidden rounded-t-2xl bg-gray-50 dark:bg-gray-700",
  placeholderClassName = "text-6xl",
}: RecipeImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const imageKey = images.join("|");

  useEffect(() => {
    setActiveIndex(0);
    setFailedImages({});
  }, [imageKey]);

  const visibleImages = useMemo(
    () => images.filter((image) => image && !failedImages[image]),
    [images, failedImages],
  );

  const currentImage = visibleImages[activeIndex] ?? null;
  const hasMultipleImages = visibleImages.length > 1;

  const goToPrevious = () => {
    setActiveIndex((index) =>
      index === 0 ? visibleImages.length - 1 : index - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((index) =>
      index === visibleImages.length - 1 ? 0 : index + 1,
    );
  };

  return (
    <div className={`relative ${className}`}>
      {currentImage ? (
        <img
          src={currentImage}
          alt={title}
          className="h-full w-full object-cover"
          onError={() =>
            setFailedImages((current) => ({ ...current, [currentImage]: true }))
          }
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center text-gray-200 dark:text-gray-500 ${placeholderClassName}`}
        >
          <ImageIcon className="h-12 w-12" />
        </div>
      )}

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition-colors hover:bg-white hover:text-gray-900 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition-colors hover:bg-white hover:text-gray-900 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {visibleImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
                aria-label={`Show image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
