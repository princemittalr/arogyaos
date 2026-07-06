import { useState, useEffect, useRef, UIEvent } from 'react';

export interface UseVirtualOptions {
  itemHeight: number;
  overscan?: number;
}

export function useVirtual<T>(items: T[], options: UseVirtualOptions) {
  const { itemHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + containerHeight) / itemHeight) + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
    style: {
      position: 'absolute' as const,
      top: 0,
      transform: `translateY(${(startIndex + index) * itemHeight}px)`,
      width: '100%',
      height: `${itemHeight}px`,
    },
  }));

  return {
    containerRef,
    visibleItems,
    totalHeight,
    onScroll,
  };
}
export default useVirtual;
