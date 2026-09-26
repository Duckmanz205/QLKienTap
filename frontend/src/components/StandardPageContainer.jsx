import React from 'react';

export default function StandardPageContainer({ children, className = '', ...props }) {
  // Dành cho các trang form, thông báo, setting cần có lề để không dính sát viền
  return (
    <div className={`flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto w-full h-full ${className}`} {...props}>
      {children}
    </div>
  );
}
