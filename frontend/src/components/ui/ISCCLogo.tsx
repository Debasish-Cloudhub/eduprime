'use client';
import Image from 'next/image';

interface ISCCLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'sidebar';
}

export default function ISCCLogo({ size = 'md', showText = true, variant = 'default' }: ISCCLogoProps) {
  const dims = { sm: 28, md: 36, lg: 52 };
  const dim = dims[size];
  const textSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-sm';
  const subtextSize = size === 'lg' ? 'text-[10px]' : 'text-[9px]';

  return (
    <div className="flex items-center gap-2.5">
      {/* Original SVG logo - dark blue diamond, red border, white iscc text */}
      <Image src="/iscc-logo.svg" alt="ISCC Logo" width={dim} height={dim} priority />
      {showText && (
        <div>
          <div className={`font-black leading-none block ${textSize}`}>
            {/* Always use original brand colors: dark navy ISCC + red Digital */}
            <span style={{ color: '#1E3A8A' }}>ISCC</span>
            <span style={{ color: '#E11D48' }}> Digital</span>
          </div>
          <div className={`leading-none tracking-widest uppercase ${subtextSize}`}
            style={{ color: variant === 'sidebar' ? 'rgba(255,255,255,0.6)' : '#6b7280', fontSize: '9px' }}>
            International Study & Career Counselling
          </div>
        </div>
      )}
    </div>
  );
}
