import { useEffect, useState } from 'react';

interface PouchPreviewProps {
  size: { id: string; name: string; dimensions: string };
  material: { id: string; name: string; spec: string };
  optional: { id: string; name: string };
  corner: { id: string; name: string };
  designUrl?: string;
}

// Boyut oranlarına göre viewBox hesaplama
const getDimensions = (sizeId: string) => {
  const dims: Record<string, { width: number; height: number; ratio: number }> = {
    '8x13x6': { width: 160, height: 260, ratio: 0.62 },
    '10x15x7': { width: 200, height: 300, ratio: 0.67 },
    '12x18x8': { width: 240, height: 360, ratio: 0.67 },
    '14x20x9': { width: 280, height: 400, ratio: 0.70 },
    '16x22x10': { width: 320, height: 440, ratio: 0.73 },
  };
  return dims[sizeId] || dims['10x15x7'];
};

// Malzeme renkleri
const getMaterialColor = (materialId: string) => {
  const colors: Record<string, { base: string; highlight: string; shadow: string; texture?: string }> = {
    'alu-paper': { 
      base: '#e8e8e8', 
      highlight: '#f5f5f5', 
      shadow: '#c0c0c0',
      texture: 'url(#aluminum)'
    },
    'matte': { 
      base: '#d0d0d0', 
      highlight: '#e0e0e0', 
      shadow: '#a0a0a0' 
    },
    'glossy': { 
      base: '#f0f0f0', 
      highlight: '#ffffff', 
      shadow: '#d0d0d0' 
    },
    'kraft': { 
      base: '#c4a77d', 
      highlight: '#d4b78d', 
      shadow: '#a08060' 
    },
    'recyclable': { 
      base: '#90c695', 
      highlight: '#a8d4ac', 
      shadow: '#70a670' 
    },
  };
  return colors[materialId] || colors['matte'];
};

export default function PouchPreview({ size, material, optional, corner, designUrl }: PouchPreviewProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const dims = getDimensions(size.id);
  const colors = getMaterialColor(material.id);
  const hasZip = optional.id === 'zip' || optional.id === 'zip-valve';
  const hasValve = optional.id === 'valve' || optional.id === 'zip-valve';
  const isRoundCorner = corner.id === 'round';

  // Değişikliklerde animasyon tetikle
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [size.id, material.id, optional.id, corner.id]);

  const cornerRadius = isRoundCorner ? 20 : 8;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Ölçü göstergesi */}
      <div className="mb-3 flex justify-center">
        <span className="text-xs text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {size.dimensions} cm
        </span>
      </div>

      {/* 3D Mockup Container */}
      <div 
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#f8fbff] to-[#eef5ff] dark:from-[#1e293b] dark:to-[#0f172a] p-3 transition-all duration-300 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
        style={{ aspectRatio: `${dims.width}/${dims.height}` }}
      >
        <svg
          viewBox={`0 0 ${dims.width + 40} ${dims.height + 60}`}
          className="w-full h-full drop-shadow-xl"
        >
          <defs>
            {/* Alüminyum dokusu */}
            <pattern id="aluminum" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="#e8e8e8"/>
              <circle cx="2" cy="2" r="0.5" fill="#d0d0d0"/>
            </pattern>
            
            {/* Gradientler */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.highlight} />
              <stop offset="50%" stopColor={colors.base} />
              <stop offset="100%" stopColor={colors.shadow} />
            </linearGradient>
            
            <linearGradient id="glossyReflection" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.1" />
              <stop offset="50%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0.1" />
            </linearGradient>

            {/* Fermuar pattern */}
            <pattern id="zipPattern" patternUnits="userSpaceOnUse" width="8" height="4">
              <rect width="8" height="4" fill="#333"/>
              <rect x="2" y="1" width="4" height="2" fill="#555"/>
            </pattern>
          </defs>

          {/* Gölge */}
          <ellipse 
            cx={(dims.width + 40) / 2} 
            cy={dims.height + 50} 
            rx={dims.width / 2} 
            ry="15" 
            fill="black" 
            opacity="0.15"
            filter="blur(8px)"
          />

          {/* Poşet gövdesi */}
          <g transform="translate(20, 40)">
            {/* Ana gövde */}
            <path
              d={`
                M 0 ${cornerRadius}
                Q 0 0 ${cornerRadius} 0
                L ${dims.width - cornerRadius} 0
                Q ${dims.width} 0 ${dims.width} ${cornerRadius}
                L ${dims.width} ${dims.height - 40}
                Q ${dims.width} ${dims.height} ${dims.width - 40} ${dims.height}
                L 40 ${dims.height}
                Q 0 ${dims.height} 0 ${dims.height - 40}
                Z
              `}
              fill={colors.texture || 'url(#bodyGradient)'}
              stroke={colors.shadow}
              strokeWidth="1"
            />

            {/* Parlaklık efekti (glossy için) */}
            {material.id === 'glossy' && (
              <path
                d={`
                  M 10 ${cornerRadius + 10}
                  L ${dims.width - 10} ${cornerRadius + 10}
                  L ${dims.width - 20} ${dims.height / 2}
                  L 20 ${dims.height / 2}
                  Z
                `}
                fill="url(#glossyReflection)"
                opacity="0.5"
              />
            )}

            {/* Fermuar */}
            {hasZip && (
              <g>
                <rect
                  x="10"
                  y="15"
                  width={dims.width - 20}
                  height="12"
                  rx="2"
                  fill="url(#zipPattern)"
                />
                <rect
                  x={dims.width / 2 - 15}
                  y="8"
                  width="30"
                  height="20"
                  rx="4"
                  fill="#333"
                />
                <circle cx={dims.width / 2} cy="18" r="6" fill="#555" />
              </g>
            )}

            {/* Valf */}
            {hasValve && (
              <g transform={`translate(${dims.width - 50}, ${dims.height / 2})`}>
                <circle cx="15" cy="15" r="12" fill="#fff" stroke="#ddd" strokeWidth="2"/>
                <circle cx="15" cy="15" r="8" fill="none" stroke="#999" strokeWidth="1"/>
                <text x="15" y="19" textAnchor="middle" fontSize="8" fill="#666">deg</text>
              </g>
            )}

            {/* Tasarım alanı (kullanıcı dosya yüklediğinde) */}
            {designUrl && (
              <image
                x="20"
                y={hasZip ? "50" : "30"}
                width={dims.width - 40}
                height={dims.height - 100}
                href={designUrl}
                preserveAspectRatio="xMidYMid meet"
                opacity="0.9"
              />
            )}

            {!designUrl && (
              <>
                {/* Örnek tasarım placeholder */}
                <rect
                  x="30"
                  y={hasZip ? "60" : "40"}
                  width={dims.width - 60}
                  height={dims.height - 120}
                  fill="white"
                  opacity="0.3"
                  rx="4"
                />
                <text
                  x={dims.width / 2}
                  y={dims.height / 2}
                  textAnchor="middle"
                  fontSize="12"
                  fill={colors.shadow}
                  opacity="0.5"
                >
                  Tasarım Alanı
                </text>
              </>
            )}

            {/* Malzeme etiketi */}
            <rect
              x="20"
              y={dims.height - 35}
              width="80"
              height="20"
              rx="2"
              fill="white"
              opacity="0.9"
            />
            <text
              x="60"
              y={dims.height - 22}
              textAnchor="middle"
              fontSize="8"
              fill="#333"
            >
              {material.name.substring(0, 15)}
            </text>
          </g>
        </svg>

        {/* Boyut göstergeleri */}
        <div className="absolute left-0 top-10 bottom-20 flex items-center">
          <div className="h-px w-4 bg-gray-400 dark:bg-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400 -rotate-90 whitespace-nowrap ml-2">
            {size.dimensions.split('x')[1]} cm
          </span>
        </div>
        <div className="absolute bottom-0 left-10 right-10 flex justify-center items-center">
          <div className="w-px h-4 bg-gray-400 dark:bg-gray-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {size.dimensions.split('x')[0]} cm
          </span>
        </div>
      </div>

      {/* Özellik rozetleri */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {hasZip && (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-800 rounded-sm"></span>
            Fermuarlı
          </span>
        )}
        {hasValve && (
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 text-xs rounded-full">
            Hava Valfli
          </span>
        )}
        {material.id === 'recyclable' && (
          <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 text-xs rounded-full">
            ♻️ Geri Dönüştürülebilir
          </span>
        )}
      </div>
    </div>
  );
}
