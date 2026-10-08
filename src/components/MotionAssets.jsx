import React from 'react';
import { Plane, Laptop, Trophy, Play, Pause } from 'lucide-react';

/**
 * Lightweight CSS/SVG motion assets.
 * The supplied .lottie files remain in /public/lottie as visual references only;
 * the production UI does not load the Lottie runtime.
 */
export const PlayPauseMotion = ({ playing = false }) => (
  <span className={`motion-playpause ${playing ? 'is-playing' : ''}`} aria-hidden="true">
    <span className="motion-playpause__halo" />
    <span className="motion-playpause__glyph motion-playpause__glyph--play"><Play size={20} fill="currentColor" /></span>
    <span className="motion-playpause__glyph motion-playpause__glyph--pause"><Pause size={20} fill="currentColor" /></span>
    <span className={`motion-playpause__bar ${playing ? 'is-playing' : ''}`} />
  </span>
);

export const FireMotion = ({ active = true }) => (
  <span className={`motion-fire ${active ? 'is-active' : ''}`} aria-hidden="true">
    <span className="motion-fire__outer" />
    <span className="motion-fire__inner" />
    <span className="motion-fire__core" />
  </span>
);

export const CardStackMotion = ({ compact = false }) => (
  <span className={`motion-cardstack ${compact ? 'is-compact' : ''}`} aria-hidden="true">
    <span className="motion-cardstack__card motion-cardstack__card--back" />
    <span className="motion-cardstack__card motion-cardstack__card--mid" />
    <span className="motion-cardstack__card motion-cardstack__card--front">
      <span className="motion-cardstack__line" />
      <span className="motion-cardstack__line motion-cardstack__line--short" />
    </span>
  </span>
);

export const PlaneMotion = () => (
  <span className="motion-plane" aria-hidden="true">
    <span className="motion-plane__trail motion-plane__trail--one" />
    <span className="motion-plane__trail motion-plane__trail--two" />
    <Plane className="motion-plane__icon" size={64} strokeWidth={1.8} />
  </span>
);

export const LaptopMotion = () => (
  <span className="motion-laptop" aria-hidden="true">
    <span className="motion-laptop__screen">
      <span className="motion-laptop__code">_ _ _</span>
      <span className="motion-laptop__cursor" />
    </span>
    <span className="motion-laptop__base" />
  </span>
);

export const TrophyMotion = () => (
  <span className="motion-trophy" aria-hidden="true">
    <span className="motion-trophy__ring motion-trophy__ring--one" />
    <span className="motion-trophy__ring motion-trophy__ring--two" />
    <Trophy className="motion-trophy__icon" size={110} strokeWidth={1.5} />
    <span className="motion-trophy__spark motion-trophy__spark--one" />
    <span className="motion-trophy__spark motion-trophy__spark--two" />
  </span>
);

export default {
  PlayPauseMotion,
  FireMotion,
  CardStackMotion,
  PlaneMotion,
  LaptopMotion,
  TrophyMotion,
};
