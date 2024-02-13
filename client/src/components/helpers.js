import { useCallback, useState } from 'react';

export const useCenteredTree = (defaultTranslate = { x: 150, y: 60 }) => {
  const [translate, setTranslate] = useState(defaultTranslate);
  const [dimensions, setDimensions] = useState();
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      let { width, height } = containerElem.getBoundingClientRect();

      console.log(width, height);
      setDimensions({ width, height });
      setTranslate({ x: (2 * width) / 6, y: 60 });
    }
  }, []);
  return [dimensions, translate, containerRef];
};
