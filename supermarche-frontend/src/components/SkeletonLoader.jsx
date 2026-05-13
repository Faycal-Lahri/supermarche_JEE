/**
 * Skeleton Loader Component
 * Utilisé pendant le chargement de contenu async
 */
export const SkeletonLoader = ({ width = '100%', height = '200px', borderRadius = '12px', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
            marginBottom: i < count - 1 ? '16px' : 0
          }}
        />
      ))}
    </>
  );
};

/**
 * Product Card Skeleton
 */
export const ProductCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#fff',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            animation: 'fadeSlideUp 600ms ease forwards',
            animationDelay: `${i * 100}ms`
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '4/3',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite'
            }}
          />
          <div style={{ padding: '16px 20px 20px' }}>
            <div
              style={{
                height: '12px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '6px',
                animation: 'shimmer 1.5s ease-in-out infinite',
                marginBottom: '12px',
                width: '60px'
              }}
            />
            <div
              style={{
                height: '18px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                borderRadius: '8px',
                animation: 'shimmer 1.5s ease-in-out infinite',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  height: '20px',
                  width: '80px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  borderRadius: '8px',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '18px',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Simple Line Skeleton (pour titres, textes, etc.)
 */
export const LineSkeleton = ({ width = '100%', marginBottom = '8px' }) => (
  <div
    style={{
      height: '14px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      borderRadius: '6px',
      animation: 'shimmer 1.5s ease-in-out infinite',
      width,
      marginBottom
    }}
  />
);
