import Image from 'next/image';

interface ISCCLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: 'dark' | 'light';
}

export default function ISCCLogo({ size = 'md', showText = true, textColor = 'dark' }: ISCCLogoProps) {
  const dims = { sm: 28, md: 36, lg: 52 };
  const dim = dims[size];

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/iscc-logo.svg"
        alt="ISCC Logo"
        width={dim}
        height={dim}
        priority
      />
      {showText && (
        <div>
          <div className={`font-black leading-none block ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-sm'} ${textColor === 'light' ? 'text-white' : 'text-gray-900'}`}>
            <span className={textColor === 'light' ? 'text-white' : 'text-blue-900'}>ISCC</span>
            <span className="text-red-600"> Digital</span>
          </div>
          <div className={`text-xs leading-none tracking-widest uppercase ${textColor === 'light' ? 'text-blue-200' : 'text-gray-500'}`} style={{fontSize:'9px'}}>
            International Study & Career Counselling
          </div>
        </div>
      )}
    </div>
  );
}
