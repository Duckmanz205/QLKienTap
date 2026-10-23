import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Hàm chuẩn hóa và loại bỏ dấu tiếng Việt để tìm kiếm không dấu
 */
const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

/**
 * Component Dropdown có tích hợp thanh tìm kiếm, chuẩn theo thiết kế "Xanh lá - Be"
 * 
 * @param {Array} options - Danh sách các option (mảng string, number hoặc mảng object {value, label, subLabel})
 * @param {any} value - Giá trị đang được chọn
 * @param {Function} onChange - Callback khi người dùng chọn 1 option (trả về value)
 * @param {String} placeholder - Text hiển thị khi không có lựa chọn nào (VD: "Tất cả...")
 * @param {String} searchPlaceholder - Text trong ô tìm kiếm (VD: "Tìm kiếm...")
 * @param {String} className - Custom class cho wrapper container
 * @param {String} direction - Hướng mở menu: 'down' | 'up' | 'auto' (mặc định: 'down')
 * @param {Boolean} dropUp - Shorthand cho direction="up"
 * @param {Boolean} disabled - Trạng thái vô hiệu hóa dropdown
 */
const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn một mục',
  searchPlaceholder = 'Tìm kiếm...',
  className = 'min-w-[160px]',
  direction = 'down',
  dropUp = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDirection, setOpenDirection] = useState(direction);
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const isUp = dropUp || direction === 'up' || openDirection === 'up';

  // Chuẩn hóa options thành định dạng object {value, label, subLabel}
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label !== undefined && opt.label !== null ? String(opt.label) : '',
      subLabel: opt.subLabel
    };
  });

  // Tìm label của option đang được chọn
  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Lọc options dựa trên searchTerm (hỗ trợ cả có dấu và không dấu)
  const normalizedSearchTerm = removeVietnameseTones(searchTerm.trim());
  const filteredOptions = normalizedOptions.filter(opt => {
    if (!searchTerm) return true;
    const labelLower = opt.label.toLowerCase();
    const labelWithoutTones = removeVietnameseTones(opt.label);
    const subLabelWithoutTones = opt.subLabel ? removeVietnameseTones(opt.subLabel) : '';

    return (
      labelLower.includes(searchTerm.toLowerCase()) ||
      labelWithoutTones.includes(normalizedSearchTerm) ||
      subLabelWithoutTones.includes(normalizedSearchTerm)
    );
  });

  // Xử lý click ra ngoài để đóng dropdown & phím Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Tự động focus vào ô tìm kiếm khi mở menu
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen) {
      if (dropUp || direction === 'up') {
        setOpenDirection('up');
      } else if (direction === 'auto') {
        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          if (spaceBelow < 250 && rect.top > spaceBelow) {
            setOpenDirection('up');
          } else {
            setOpenDirection('down');
          }
        }
      } else {
        setOpenDirection('down');
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optValue) => {
    if (disabled) return;
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        onClick={handleToggle}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm flex justify-between items-center transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-100 border-[#E7E0C4]'
            : isOpen
              ? 'border-[#407F3E] ring-1 ring-[#407F3E] cursor-pointer'
              : 'border-[#E7E0C4] hover:border-[#407F3E] cursor-pointer'
        }`}
      >
        <span className={`truncate pr-2 font-medium ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isUp
              ? (isOpen ? 'rotate-0 text-[#407F3E]' : 'rotate-180')
              : (isOpen ? 'rotate-180 text-[#407F3E]' : 'rotate-0')
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute left-0 w-full bg-white border border-[#E7E0C4] rounded-xl shadow-xl z-50 py-1 overflow-hidden flex flex-col min-w-[200px] ${
            isUp
              ? 'bottom-full mb-1 animate-in slide-in-from-bottom-2 duration-150'
              : 'top-full mt-1 animate-in slide-in-from-top-2 duration-150'
          }`}
        >
          <div className="px-2 pb-1.5 pt-1 border-b border-[#E7E0C4] mb-1">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-lg text-xs focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-colors"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = String(value) === String(opt.value);
                return (
                  <div
                    key={`${opt.value}-${index}`}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      isSelected
                        ? 'bg-[#E7E0C4] text-slate-800 font-bold'
                        : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.subLabel && (
                        <div className="text-[11px] font-normal text-slate-500 truncate">{opt.subLabel}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#407F3E] shrink-0 ml-2" />}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-slate-500 text-center italic">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;

