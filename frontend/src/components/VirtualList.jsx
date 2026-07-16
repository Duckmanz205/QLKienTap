import React, { useState, useRef, useEffect } from 'react';

/**
 * A highly optimized, React 19 compatible Virtual Scroll List.
 * Only renders items visible in the viewport to maintain 60 FPS performance for large datasets.
 */
export default function VirtualList({
  items = [],
  itemHeight = 60,
  height = 400,
  renderItem,
  buffer = 5,
  className = "",
  containerStyle = {}
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + height) / itemHeight) + buffer);

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      item: items[i],
      index: i,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${itemHeight}px`,
        transform: `translateY(${i * itemHeight}px)`,
      }
    });
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto relative border border-slate-100 rounded-xl ${className}`}
      style={{ height: `${height}px`, ...containerStyle }}
    >
      <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
