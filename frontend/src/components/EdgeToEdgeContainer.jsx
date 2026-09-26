import React from 'react';

export default function EdgeToEdgeContainer({ children, className = '', ...props }) {
  // Container này chiếm đúng 100% không gian màn hình (trừ đi Header 64px)
  // Ngăn chặn trang bị kéo dài vô tận, ép các component con tự cuộn nội bộ (internal scroll)
  return (
    <div className={`flex flex-col relative w-full h-[calc(100vh-64px)] p-4 md:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
