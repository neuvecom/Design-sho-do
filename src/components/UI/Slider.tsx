import type { InputHTMLAttributes } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
}

export function Slider({
  label,
  showValue = false,
  value,
  className = '',
  ...props
}: SliderProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-stone-500 tracking-wide">{label}</span>}
          {showValue && (
            <span className="font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-xs">
              {value}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        value={value}
        className="w-full h-1.5 bg-gradient-to-r from-stone-200 to-stone-300 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-stone-700
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-200
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:hover:bg-stone-800
          [&::-webkit-slider-thumb]:shadow-md
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:bg-stone-700
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:shadow-md"
        {...props}
      />
    </div>
  )
}
