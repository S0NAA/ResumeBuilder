import { Check, Palette } from 'lucide-react';
import React, { useState } from 'react';

const ColorPicker = ({ selectedColor, onChange }) => {
  const colors = [
       { name: "Blue", value: "#3B82F6" },
       { name: "Indigo", value: "#6366F1" },
       { name: "Purple", value: "#8B5CF6" },
       { name: "Violet", value: "#7C3AED" },
       { name: "Cyan", value: "#06B6D4" },
       { name: "Teal", value: "#14B8A6" },
       { name: "Green", value: "#10B981" },
       { name: "Lime", value: "#84CC16" },
       { name: "Yellow", value: "#EAB308" },
       { name: "Amber", value: "#F59E0B" },
       { name: "Orange", value: "#F97316" },
       { name: "Red", value: "#EF4444" },
       { name: "Rose", value: "#F43F5E" },
       { name: "Pink", value: "#EC4899" },
       { name: "Fuchsia", value: "#D946EF" },
       { name: "Slate", value: "#64748B" },
       { name: "Gray", value: "#687280" },
       { name: "Neutral", value: "#737373" },
       { name: "Black", value: "#1F2937" },
       { name: "White", value: "#F5F5F5" },
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-purple-600 bg-gradient-to-br from-purple-50
        to-purple-100 ring-purple-300 hover:ring transition-all px-3 py-2 rounded-lg" >
        <Palette size={16} /> <span className="max-sm:hidden">Accent</span>
      </button>

      {isOpen && (
        <div className="grid grid-cols-4 w-60 gap-2 absolute top-full left-0 p-3 mt-2 z-10
         bg-white rounded-md border border-gray-200 shadow-sm">
          {colors.map((color) => (
            <div key={color.value}className="relative cursor-pointer group flex flex-col items-center"
              onClick={() => {onChange(color.value);setIsOpen(false);
              }}
            >
              <div
                className="w-12 h-12 rounded-full border-2 border-transparent group-hover:border-black/25 transition-colors"
                style={{ backgroundColor: color.value }}
              >
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="size-5 text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-1 text-gray-600">{color.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
