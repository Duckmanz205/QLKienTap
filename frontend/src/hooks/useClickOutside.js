import { useEffect, useRef } from 'react';

/**
 * Custom Hook tự động gọi callback khi người dùng click/chạm ra ngoài phần tử DOM
 * hoặc khi bấm phím Escape
 * 
 * @param {Function} handler - Hàm callback khi click ra ngoài (VD: () => setIsOpen(false))
 * @param {boolean} active - Trạng thái kích hoạt (chỉ lắng nghe khi dropdown đang mở)
 * @returns {React.RefObject} - Ref gắn vào container dropdown
 */
export function useClickOutside(handler, active = true) {
  const domNodeRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event) => {
      // Nếu click xảy ra bên ngoài domNodeRef
      if (domNodeRef.current && !domNodeRef.current.contains(event.target)) {
        handler(event);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    // Dùng capture: true để đảm bảo bắt sự kiện trước khi bị stopPropagation() chặn ở bất kỳ thẻ con nào
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handler, active]);

  return domNodeRef;
}

export default useClickOutside;
