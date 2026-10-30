import React from 'react';

interface SubgroupCodeTagProps {
  code: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  isMainTeam?: boolean;
}

/**
 * Prominent, bold, visually distinct subgroup code badge (e.g. 1.1 vs 1.2 or 1, 2, 3, 4)
 * Featuring high-contrast dark mono typography, vibrant track theme background, and ambient colored glow.
 */
export const SubgroupCodeTag: React.FC<SubgroupCodeTagProps> = ({
  code,
  color,
  size = 'md',
  className = '',
  isMainTeam = false
}) => {
  const sizeMap = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-md font-black min-w-[22px]',
    sm: 'text-xs px-2 py-0.5 rounded-lg font-black min-w-[28px]',
    md: 'text-xs sm:text-sm px-2.5 py-1 rounded-xl font-black min-w-[34px]',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 rounded-xl font-black min-w-[44px]'
  };

  return (
    <span
      style={{
        backgroundColor: color,
        color: '#020617',
        boxShadow: `0 0 14px ${color}66, inset 0 1px 1px rgba(255, 255, 255, 0.45)`,
        textShadow: '0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
      className={`inline-flex items-center justify-center font-mono tracking-wider select-none border border-white/40 shrink-0 transform active:scale-95 transition-transform ${sizeMap[size]} ${className}`}
      title={isMainTeam ? `Κύρια Ομάδα ${code}` : `Υποομάδα ${code}`}
    >
      {code}
    </span>
  );
};
