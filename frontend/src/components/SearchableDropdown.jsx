import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Component Dropdown có tích hợp thanh tìm kiếm, chuẩn theo thiết kế "Xanh lá - Be"
 * 
 * @param {Array} options - Danh sách các option (có thể là mảng string hoặc mảng object {value, label})
 * @param {any} value - Giá trị đang được chọn
 * @param {Function} onChange - Callback khi người dùng chọn 1 option (trả về value)
 * @param {String} placeholder - Text hiển thị khi không có lựa chọn nào (VD: "Tất cả...")
 * @param {String} searchPlaceholder - Text trong ô tìm kiếm (VD: "Tìm kiếm...")
 * @param {String} className - Custom class cho wrapper container
 */
const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn một mục',
  searchPlaceholder = 'Tìm kiếm...',
  className = 'min-w-[160px]'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Chuẩn hóa options thành định dạng object {value, label} để dễ xử lý
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Tìm label của option đang được chọn
  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Lọc options dựa trên searchTerm
  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${
          isOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'
        }`}
      >
        <span className="text-slate-700 font-medium truncate pr-2">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-50 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[200px]">
          <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Tránh đóng khi click vào ô search
              className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = value === opt.value;
                return (
                  <div
                    key={`${opt.value}-${index}`}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                      isSelected
                        ? 'bg-[#E7E0C4] text-slate-800 font-bold'
                        : 'text-slate-700 hover:bg-[#E7E0C4]/50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#407F3E] flex-shrink-0 ml-2" />}
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
