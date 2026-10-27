import React from 'react';

/**
 * Manekin full-body ilustratif untuk pemasangan mockup jersey RESMI (transparan).
 * Wujud kepala, lengan, celana, dan sepatu merupakan visualisasi ilustratif;
 * tekstur dan logo jersey tetap berasal dari file panitia, bukan hasil AI.
 */
export default function MannequinFigure({ image, back = false, label = '' }) {
  const id = back ? 'rear' : 'front';
  return (
    <svg className="mannequin-art" viewBox="0 0 600 960" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${label}, tampak ${back ? 'belakang' : 'depan'} pada manekin seluruh tubuh`}>
      <defs>
        <linearGradient id={`${id}-skin`} x1="0%" y1="25%" x2="100%" y2="75%"><stop offset="0" stopColor="#3d5260"/><stop offset=".27" stopColor="#c7d1d5"/><stop offset=".48" stopColor="#aabcc5"/><stop offset=".78" stopColor="#596c7b"/><stop offset="1" stopColor="#293849"/></linearGradient>
        <linearGradient id={`${id}-pant`} x1="0%" y1="0%" x2="100%" y2="0%"><stop stopColor="#091b2a"/><stop offset=".28" stopColor="#24384a"/><stop offset=".47" stopColor="#132838"/><stop offset=".78" stopColor="#091622"/><stop offset="1" stopColor="#06101e"/></linearGradient>
        <linearGradient id={`${id}-boot`} x1="0%" y1="0%" x2="70%" y2="100%"><stop stopColor="#384d59"/><stop offset=".5" stopColor="#142532"/><stop offset="1" stopColor="#07101b"/></linearGradient>
        <radialGradient id={`${id}-head`} cx="27%" cy="19%" r="86%"><stop stopColor="#f3f4ee"/><stop offset=".32" stopColor="#cfd9d7"/><stop offset=".7" stopColor="#80939d"/><stop offset="1" stopColor="#3f5868"/></radialGradient>
        <filter id={`${id}-shadow`} x="-25%" y="-25%" width="150%" height="180%"><feGaussianBlur stdDeviation="13"/></filter>
      </defs>
      <ellipse cx="304" cy="928" rx="153" ry="18" fill="#000" opacity=".3" filter={`url(#${id}-shadow)`}/>
      <ellipse cx="304" cy="910" rx="152" ry="26" fill="#17354b" stroke="#7c9da4" strokeOpacity=".65" strokeWidth="4"/>
      <ellipse cx="304" cy="909" rx="120" ry="12" fill="#3a6680" opacity=".38"/>
      {/* head and neck, a featureless professional shop mannequin */}
      <path d="M277 166 L276 211 Q300 227 327 209 L321 166 Z" fill={`url(#${id}-skin)`} stroke="#657a87" strokeWidth="2"/>
      <path d="M263 73 Q270 48 301 45 Q345 45 352 94 L352 138 Q340 181 304 193 Q265 177 253 139 Q246 112 263 73Z" fill={`url(#${id}-head)`} stroke="#6b8796" strokeWidth="2"/>
      {!back && <><path d="M271 111 Q281 116 292 110 M316 110 Q326 116 336 110" stroke="#687985" strokeWidth="2" strokeOpacity=".32" fill="none"/><path d="M300 117 L295 140 Q305 144 310 139" fill="none" stroke="#65808d" strokeWidth="2" strokeOpacity=".25"/></>}
      {back && <path d="M268 100 Q302 68 342 103" fill="none" stroke="#e8f2f3" strokeWidth="2" opacity=".16"/>}
      {/* forearms and fingers (shirt sleeves are layered on top) */}
      <path d="M145 336 Q134 375 140 423 L147 513 Q148 536 164 545 Q186 547 191 522 L184 423 Q186 373 200 348Z" fill={`url(#${id}-skin)`} stroke="#607887" strokeWidth="2"/>
      <path d="M413 348 Q427 373 419 420 L414 523 Q417 546 435 545 Q452 539 457 519 L463 416 Q463 363 450 335Z" fill={`url(#${id}-skin)`} stroke="#607887" strokeWidth="2"/>
      <path d="M150 520 Q140 536 145 558 Q150 581 167 579 Q183 570 183 548 L182 521Z M418 523 L417 546 Q416 574 436 579 Q455 578 456 557 L449 522Z" fill={`url(#${id}-skin)`} stroke="#577484" strokeWidth="2"/>
      {/* jeans/trousers with volume and lighting */}
      <path d="M224 561 Q298 545 382 564 L389 671 L378 853 Q358 867 326 857 L303 679 L290 679 L277 854 Q251 867 222 855 L210 664Z" fill={`url(#${id}-pant)`} stroke="#030e18" strokeWidth="5"/>
      <path d="M222 586 Q297 610 381 585 M305 615 L302 680 M252 616 L250 843 M348 624 L352 843" fill="none" stroke="#7895a7" strokeWidth="3" strokeOpacity=".25"/>
      <path d="M230 668 L278 680 L274 844 Q260 855 228 846Z" fill="#4b6677" opacity=".16"/><path d="M334 681 L378 673 L373 844 L345 848Z" fill="#000" opacity=".2"/>
      <path d="M213 851 Q234 846 278 851 L283 870 Q286 889 264 895 L199 895 Q187 887 196 871Z" fill={`url(#${id}-boot)`} stroke="#08131e" strokeWidth="3"/>
      <path d="M326 852 Q357 847 377 852 L408 870 Q419 884 406 895 L333 895 Q321 887 323 870Z" fill={`url(#${id}-boot)`} stroke="#08131e" strokeWidth="3"/>
      <path d="M197 887 L275 888 M331 888 L410 888" fill="none" stroke="#99aeb4" strokeWidth="3" strokeOpacity=".52"/>
      {/* Exactly the submitted transparent apparel mockup, unaltered */}
      <image href={image} x="103" y="169" width="394" height="473" preserveAspectRatio="xMidYMid meet"/>
      <path d="M205 602 Q298 623 390 601" fill="none" stroke="#ebf5fa" strokeOpacity=".14" strokeWidth="2"/>
    </svg>
  );
}
