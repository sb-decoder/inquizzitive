import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const GlassmorphicDropdown = ({ options, defaultOption, onSelect, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultOption || options[0]);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
        setRect({ top: top + height + 8, left: left, width });
      }
    };

    if (isOpen) {
      updatePosition(); 
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  const baseClasses = `relative text-white font-semibold ${className || 'w-full'}`;
  const buttonClasses = "w-full px-4 py-2 text-left rounded-full cursor-pointer transition-colors duration-200 " +
                        "bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 ring-1 ring-white/30";
  const optionClasses = "px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-white/30 text-white";

  const DropdownMenu = () => {
    const menuClasses = "fixed z-50 rounded-xl max-h-60 overflow-y-auto transition-all duration-300 ease-in-out transform origin-top " +
                        "bg-white/10 backdrop-blur-md shadow-2xl border border-white/20";

    return (
      <div
        className={menuClasses}
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transform: isOpen ? 'scaleY(1)' : 'scaleY(0.95)',
        }}
      >
        <div className="py-1">
          {options.map((option) => (
            <div
              key={option}
              className={optionClasses + (selected === option ? ' bg-white/30' : '')}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={baseClasses} ref={containerRef}>
      <button
        type="button"
        className={buttonClasses}
        onClick={() => setIsOpen(!isOpen)}
        ref={buttonRef}
      >
        <div className="flex justify-between items-center">
          <span>{selected}</span>
          <svg
            className={"w-4 h-4 transition-transform duration-300 " + (isOpen ? 'transform rotate-180' : '')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      {createPortal(<DropdownMenu />, document.body)}
    </div>
  );
};

export default GlassmorphicDropdown;
