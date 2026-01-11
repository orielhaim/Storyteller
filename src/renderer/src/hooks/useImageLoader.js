import { useState, useEffect } from 'react';

function useImageLoader(imageUuid) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!imageUuid || typeof imageUuid !== 'string') return;

    let isMounted = true;
    window.imageAPI.getData(imageUuid)
      .then(result => {
        if (isMounted && result.success && result.data) {
          setSrc(result.data);
        }
      })
      .catch(err => console.error(`Failed to load image ${imageUuid}`, err));

    return () => { isMounted = false; };
  }, [imageUuid]);

  return src;
}

export default useImageLoader;