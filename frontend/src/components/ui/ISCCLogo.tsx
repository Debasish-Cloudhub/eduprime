'use client';

interface ISCCLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'sidebar';
}

// Inline SVG ensures original colors always show correctly regardless of context
const ISCCDiamondSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
    <rect x="10" y="10" width="80" height="80" rx="14" transform="rotate(45 50 50)" fill="#1E3A8A"/>
    <rect x="18" y="18" width="64" height="64" rx="10" transform="rotate(45 50 50)" fill="none" stroke="#E11D48" strokeWidth="2" opacity="0.9"/>
    <text x="50" y="58" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="26" fill="white">iscc</text>
  </svg>
);

export default function ISCCLogo({ size = 'md', showText = true, variant = 'default' }: ISCCLogoProps) {
  const dims = { sm: 32, md: 40, lg: 56 };
  const dim = dims[size];
  const textSize = size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm';

  return (
    <div className="flex items-center gap-2.5">
      <ISCCDiamondSVG size={dim} />
      {showText && (
        <div>
          <div className={`font-black leading-tight ${textSize}`}>
            {/* Original ISCC brand colors — always dark navy + red */}
            <span style={{ color: '#1E3A8A' }}>ISCC</span>
            <span style={{ color: '#E11D48' }}> Digital</span>
          </div>
          <div style={{ fontSize: '9px', color: variant === 'sidebar' ? 'rgba(147,197,253,0.8)' : '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.2 }}>
            International Study &amp; Career Counselling
          </div>
        </div>
      )}
    </div>
  );
}
