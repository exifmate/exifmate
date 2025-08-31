import type { UnlistenFn } from '@tauri-apps/api/event';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onImagesOpened } from './core/events';
import type { ImageInfo } from './core/types';

interface ImageContext {
  images: ImageInfo[];
  selectedImages: ImageInfo[];
  setSelectedImages: Dispatch<SetStateAction<ImageInfo[]>>;
}

const ImageSelectionContext = createContext<ImageContext>({
  images: [],
  selectedImages: [],
  setSelectedImages: () => {},
});

export const useImageSelection = () => useContext(ImageSelectionContext);

interface Props {
  children: ReactNode;
}

export function ImageProvider({ children }: Props) {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    onImagesOpened((images) => {
      setImages(images);
    }).then((clean) => {
      unlisten = clean;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <ImageSelectionContext.Provider
      value={{ images, selectedImages, setSelectedImages }}
    >
      {children}
    </ImageSelectionContext.Provider>
  );
}
