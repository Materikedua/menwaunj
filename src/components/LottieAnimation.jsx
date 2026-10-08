import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/** Lightweight wrapper for local .lottie files. Falls back silently if an animation fails. */
export const LottieAnimation = ({ src, className = '', autoplay = true, loop = true, ...props }) => {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (bad) return null;
  return (
    <DotLottieReact
      src={src}
      autoplay={autoplay}
      loop={loop}
      className={className}
      onLoadError={() => setBad(true)}
      {...props}
    />
  );
};

export default LottieAnimation;
