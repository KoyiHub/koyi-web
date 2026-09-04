import type { ReactNode } from 'react';

import type { SceneArtKey } from '@/features/runner/session/question-types';
import { cn } from '@/lib/utils/cn';

/**
 * Full-width scene illustrations for the assessment questions.
 *
 * Drawn inline so the flow runs with no binary assets. Every scene is a
 * placeholder for commissioned artwork: setting `imageUrl` on the question's
 * media block replaces the drawing with a real picture and nothing else
 * changes (see `question-media.tsx`).
 *
 * Scenes are authored on a 320×200 grid — a 16:10 frame that fills the card
 * width on the delivered screens without cropping at 390px.
 *
 * `alt` text lives on the wrapper in `question-media.tsx`, so the SVG itself is
 * `aria-hidden` and never doubles up for a screen reader.
 */

interface SceneProps {
  className?: string | undefined;
}

function Scene({ className, children }: SceneProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      className={cn('size-full', className)}
    >
      {children}
    </svg>
  );
}

interface ChildProps {
  x: number;
  y: number;
  scale?: number;
  skin?: string;
  hair?: string;
  top?: string;
  bottom?: string;
  /** Beaded braids, as worn by the girls in the delivered screens. */
  braids?: boolean;
  /** Hands meet in front of the chest, ready to hold an object. */
  holding?: boolean;
}

/**
 * One flat-vector child, drawn from the feet up so `y` is the ground line.
 * Shared by every scene so the cast looks like one illustration set rather
 * than nine unrelated drawings.
 */
function Child({
  x,
  y,
  scale = 1,
  skin = '#8d5524',
  hair = '#2b1b12',
  top = '#3b82f6',
  bottom = '#1e3a8a',
  braids = false,
  holding = false,
}: ChildProps) {
  return (
    <g transform={`translate(${String(x)} ${String(y)}) scale(${String(scale)})`}>
      <rect x="-11" y="-34" width="9" height="30" rx="4.5" fill={bottom} />
      <rect x="2" y="-34" width="9" height="30" rx="4.5" fill={bottom} />
      <rect x="-13" y="-7" width="13" height="7" rx="3.5" fill="#1f2937" />
      <rect x="0" y="-7" width="13" height="7" rx="3.5" fill="#1f2937" />
      <rect x="-15" y="-76" width="30" height="45" rx="8" fill={top} />
      {holding ? (
        <>
          <path d="M-15 -72c-9 4-12 16-4 22l8-4Z" fill={top} />
          <path d="M15 -72c9 4 12 16 4 22l-8-4Z" fill={top} />
          <circle cx="-11" cy="-47" r="5" fill={skin} />
          <circle cx="11" cy="-47" r="5" fill={skin} />
        </>
      ) : (
        <>
          <rect x="-24" y="-74" width="9" height="32" rx="4.5" fill={top} />
          <rect x="15" y="-74" width="9" height="32" rx="4.5" fill={top} />
          <circle cx="-19.5" cy="-42" r="5" fill={skin} />
          <circle cx="19.5" cy="-42" r="5" fill={skin} />
        </>
      )}
      <rect x="-4" y="-82" width="8" height="9" fill={skin} />
      {braids && (
        <>
          <circle cx="-17" cy="-90" r="4" fill={hair} />
          <circle cx="17" cy="-90" r="4" fill={hair} />
          <circle cx="-18" cy="-80" r="3" fill="#f472b6" />
          <circle cx="18" cy="-80" r="3" fill="#38bdf8" />
        </>
      )}
      <circle cx="0" cy="-94" r="15" fill={skin} />
      <path d="M-15 -96a15 15 0 0 1 30 0c1-11-6-16-15-16s-16 5-15 16Z" fill={hair} />
      <circle cx="-5.5" cy="-95" r="1.9" fill="#1f2937" />
      <circle cx="5.5" cy="-95" r="1.9" fill="#1f2937" />
      <path d="M-5 -88c3 3.5 7 3.5 10 0" stroke="#1f2937" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function CatScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#dbeafe" />
      <circle cx="46" cy="42" r="26" fill="#bfdbfe" opacity=".7" />
      <circle cx="278" cy="150" r="34" fill="#bfdbfe" opacity=".6" />
      <path d="M96 40l4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="#fbbf24" opacity=".8" />
      <path d="M236 62l3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" fill="#93c5fd" />
      <ellipse cx="160" cy="176" rx="72" ry="12" fill="#bfdbfe" />
      <ellipse cx="160" cy="176" rx="52" ry="8" fill="#a5c8f5" opacity=".6" />
      <path
        d="M158 168c-30 0-34-14-24-26 6-7 10-14 10-24h34c0 12 6 20 12 28 9 12 4 22-32 22Z"
        fill="#fb923c"
      />
      <path d="M186 152c14 4 26 10 26 18-8 4-18 2-26-4Z" fill="#f97316" />
      <path
        d="M212 170c8-2 12-8 10-14"
        stroke="#ea580c"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="160" cy="96" rx="46" ry="41" fill="#fb923c" />
      <path d="M124 66 118 26l34 18Z" fill="#f97316" />
      <path d="M196 66 202 26l-34 18Z" fill="#f97316" />
      <path d="M128 62l-3-22 19 10Z" fill="#fbcfe8" />
      <path d="M192 62l3-22-19 10Z" fill="#fbcfe8" />
      <path d="M143 55h7v14h-7ZM170 55h7v14h-7Z" fill="#ea7317" opacity=".55" />
      <ellipse cx="160" cy="112" rx="24" ry="18" fill="#ffedd5" />
      <ellipse cx="145" cy="93" rx="6.5" ry="7.5" fill="#1f2937" />
      <ellipse cx="175" cy="93" rx="6.5" ry="7.5" fill="#1f2937" />
      <circle cx="147" cy="90" r="2.2" fill="#ffffff" />
      <circle cx="177" cy="90" r="2.2" fill="#ffffff" />
      <path d="M160 103l-6 5h12Z" fill="#f43f5e" />
      <path
        d="M154 112c2 4 10 4 12 0M136 105h-22M136 113h-21M184 105h22M184 113h21"
        stroke="#c2410c"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="132" cy="106" r="6" fill="#fdba74" opacity=".8" />
      <circle cx="188" cy="106" r="6" fill="#fdba74" opacity=".8" />
    </Scene>
  );
}

function SunScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#7dd3fc" />
      <rect y="130" width="320" height="70" fill="#38bdf8" opacity=".45" />
      <g stroke="#f59e0b" strokeWidth="9" strokeLinecap="round">
        <path d="M160 22v18M160 138v18M98 90H80M240 90h18M116 46 104 34M204 46l12-12M116 134l-12 12M204 134l12 12" />
      </g>
      <circle cx="160" cy="90" r="46" fill="#fbbf24" />
      <circle cx="160" cy="90" r="36" fill="#fcd34d" />
      <circle cx="146" cy="84" r="4.5" fill="#78350f" />
      <circle cx="174" cy="84" r="4.5" fill="#78350f" />
      <path
        d="M146 100c6 8 22 8 28 0"
        stroke="#78350f"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="138" cy="96" r="5" fill="#fb923c" opacity=".7" />
      <circle cx="182" cy="96" r="5" fill="#fb923c" opacity=".7" />
      <g fill="#ffffff">
        <ellipse cx="52" cy="52" rx="24" ry="14" />
        <ellipse cx="38" cy="56" rx="16" ry="10" />
        <ellipse cx="268" cy="140" rx="28" ry="15" />
        <ellipse cx="288" cy="146" rx="18" ry="11" />
        <ellipse cx="60" cy="158" rx="22" ry="12" opacity=".85" />
      </g>
    </Scene>
  );
}

function BoyRedBallScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#fdf6ec" />
      <ellipse cx="160" cy="112" rx="98" ry="80" fill="#e0f2fe" opacity=".85" />
      <circle cx="64" cy="46" r="5" fill="#7dd3fc" />
      <circle cx="256" cy="150" r="4" fill="#7dd3fc" />
      <path
        d="M244 44l14 14M258 44l-14 14"
        stroke="#fbbf24"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M62 132l14 12H48Z" fill="#fde68a" />
      <path d="M246 108l12 10h-24Z" fill="#fde68a" />
      <ellipse cx="160" cy="184" rx="56" ry="8" fill="#e7d9c4" />
      <Child x={160} y={182} scale={1.08} top="#38bdf8" bottom="#f59e0b" hair="#5b3a1e" holding />
      <circle cx="160" cy="132" r="26" fill="#ef4444" />
      <path d="M160 106a26 26 0 0 1 18 44 34 34 0 0 0-18-44Z" fill="#dc2626" />
      <path
        d="M143 116c10-4 22-2 30 6"
        stroke="#fca5a5"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </Scene>
  );
}

function ClassroomAppleScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#fef6e7" />
      <rect y="146" width="320" height="54" fill="#e8c9a0" />
      <rect x="176" y="24" width="120" height="72" rx="6" fill="#166534" />
      <rect x="176" y="24" width="120" height="72" rx="6" stroke="#854d0e" strokeWidth="5" />
      <path
        d="M190 46h44M190 58h60M190 70h34"
        stroke="#bbf7d0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <text x="236" y="88" fill="#fde68a" fontSize="12" fontWeight="700" textAnchor="middle">
        LEARN &amp; GROW
      </text>
      <rect x="24" y="28" width="76" height="8" rx="3" fill="#a16207" />
      <g>
        <rect x="30" y="8" width="9" height="20" rx="2" fill="#ef4444" />
        <rect x="42" y="12" width="9" height="16" rx="2" fill="#3b82f6" />
        <rect x="54" y="6" width="9" height="22" rx="2" fill="#22c55e" />
        <rect x="66" y="14" width="9" height="14" rx="2" fill="#f59e0b" />
        <rect x="78" y="10" width="9" height="18" rx="2" fill="#a855f7" />
      </g>
      <Child
        x={132}
        y={168}
        scale={1.02}
        skin="#7c451f"
        hair="#1c1917"
        top="#bbf7d0"
        bottom="#166534"
        braids
        holding
      />
      <circle cx="152" cy="120" r="12" fill="#dc2626" />
      <path d="M152 108v-5" stroke="#7c4a2d" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M153 105c3-4 7-4 9-3 0 3-4 5-9 5Z" fill="#22c55e" />
      <rect x="96" y="146" width="132" height="10" rx="3" fill="#d19a5b" />
      <rect x="104" y="156" width="8" height="34" fill="#b97f42" />
      <rect x="212" y="156" width="8" height="34" fill="#b97f42" />
      <rect x="180" y="134" width="26" height="14" rx="2" fill="#fef9c3" />
      <rect x="182" y="137" width="22" height="2" fill="#cbd5e1" />
      <rect x="182" y="142" width="16" height="2" fill="#cbd5e1" />
      <path d="M228 130h14v18h-14Z" fill="#dbeafe" />
      <path d="M228 130h14v4h-14Z" fill="#93c5fd" />
    </Scene>
  );
}

function BoyBlueBagScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#f5f3ff" />
      <path d="M0 118c60-34 110 14 176-12 44-18 92-4 144 22v72H0Z" fill="#fce7f3" opacity=".7" />
      <ellipse cx="160" cy="104" rx="88" ry="74" fill="#dbeafe" opacity=".8" />
      <path d="M42 60c14-10 26 0 20 12-5 10-24 6-20-12Z" fill="#bbf7d0" />
      <path d="M270 128c12-8 22 0 17 10-4 9-20 5-17-10Z" fill="#fde68a" />
      <circle cx="66" cy="140" r="4" fill="#a5b4fc" />
      <circle cx="252" cy="52" r="5" fill="#a5b4fc" />
      <ellipse cx="160" cy="184" rx="60" ry="9" fill="#f6d5b8" />
      <Child x={160} y={182} scale={1.08} top="#1d4ed8" bottom="#1e3a8a" hair="#171717" holding />
      <rect x="136" y="112" width="48" height="46" rx="10" fill="#2563eb" />
      <rect x="136" y="126" width="48" height="12" fill="#1d4ed8" />
      <rect x="150" y="120" width="20" height="10" rx="3" fill="#93c5fd" />
      <path d="M144 112c0-10 32-10 32 0" stroke="#1e40af" strokeWidth="5" fill="none" />
    </Scene>
  );
}

function FarmScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#cfe9f7" />
      <circle cx="272" cy="34" r="22" fill="#fde68a" />
      <circle cx="272" cy="34" r="14" fill="#fbbf24" />
      <ellipse cx="66" cy="40" rx="26" ry="13" fill="#ffffff" opacity=".9" />
      <ellipse cx="112" cy="34" rx="18" ry="10" fill="#ffffff" opacity=".8" />
      <path d="M0 118h320v82H0Z" fill="#86c34a" />
      <path d="M0 118c56-14 106 10 168 2 56-8 100-10 152 4v-6H0Z" fill="#65a30d" opacity=".5" />
      <path d="M28 122V60l40-26 40 26v62Z" fill="#dc2626" />
      <path d="M28 60 68 34l40 26Z" fill="#b91c1c" />
      <rect x="52" y="82" width="32" height="40" fill="#7f1d1d" />
      <path d="M52 82h32M68 82v40M52 92l32 20M84 92 52 112" stroke="#fca5a5" strokeWidth="2.4" />
      <rect x="60" y="52" width="16" height="14" fill="#fef3c7" />
      <g stroke="#a16207" strokeWidth="4" strokeLinecap="round">
        <path d="M196 106v34M232 106v34M268 106v34M304 106v34M190 114h120M190 126h120" />
      </g>
      <g transform="translate(232 112) scale(0.86)">
        <ellipse cx="0" cy="0" rx="30" ry="20" fill="#f8fafc" />
        <path d="M-22-6c8-6 16-2 14 5-2 8-16 7-14-5Z" fill="#78350f" />
        <path d="M14 2c7 4 7 13 0 15-8 2-13-5-10-11 2-4 6-6 10-4Z" fill="#78350f" />
        <rect x="-20" y="16" width="7" height="16" rx="3" fill="#f1f5f9" />
        <rect x="12" y="16" width="7" height="16" rx="3" fill="#f1f5f9" />
        <ellipse cx="-30" cy="-10" rx="12" ry="11" fill="#f8fafc" />
        <ellipse cx="-33" cy="-5" rx="6" ry="5" fill="#fbcfe8" />
        <circle cx="-32" cy="-14" r="1.8" fill="#1f2937" />
        <path d="M-40-18c-4-4-4-7-1-7 3 0 5 3 5 6Z" fill="#e2e8f0" />
      </g>
      <Child
        x={128}
        y={166}
        scale={1}
        skin="#8d5524"
        hair="#3f2a13"
        top="#facc15"
        bottom="#a16207"
      />
      <g fill="#f8fafc">
        <ellipse cx="86" cy="176" rx="12" ry="9" />
        <ellipse cx="118" cy="184" rx="12" ry="9" />
        <ellipse cx="168" cy="180" rx="12" ry="9" />
        <ellipse cx="200" cy="172" rx="11" ry="8" />
        <ellipse cx="60" cy="186" rx="11" ry="8" />
      </g>
      <g fill="#f59e0b">
        <path d="M96 170h6l4 3-4 3h-6Z" />
        <path d="M128 178h6l4 3-4 3h-6Z" />
        <path d="M178 174h6l4 3-4 3h-6Z" />
        <path d="M209 166h6l4 3-4 3h-6Z" />
        <path d="M69 180h6l4 3-4 3h-6Z" />
      </g>
      <g fill="#ef4444">
        <circle cx="94" cy="167" r="3" />
        <circle cx="126" cy="175" r="3" />
        <circle cx="176" cy="171" r="3" />
      </g>
      <g fill="#fbbf24">
        <circle cx="150" cy="158" r="2" />
        <circle cx="158" cy="166" r="2" />
        <circle cx="146" cy="172" r="2" />
        <circle cx="162" cy="176" r="2" />
      </g>
    </Scene>
  );
}

function BedroomWakeScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#fef3c7" />
      <rect y="150" width="320" height="50" fill="#d9a441" />
      <rect x="22" y="24" width="88" height="72" rx="6" fill="#bae6fd" />
      <rect x="22" y="24" width="88" height="72" rx="6" stroke="#f8fafc" strokeWidth="7" />
      <path d="M66 24v72M22 60h88" stroke="#f8fafc" strokeWidth="6" />
      <circle cx="86" cy="46" r="10" fill="#fde68a" />
      <g stroke="#fcd34d" strokeWidth="4" strokeLinecap="round" opacity=".9">
        <path d="M118 40l30 14M118 60l30 4M118 80l28-8" />
      </g>
      <rect x="150" y="96" width="150" height="58" rx="8" fill="#e0e7ff" />
      <rect x="150" y="96" width="150" height="20" rx="8" fill="#c7d2fe" />
      <rect x="286" y="70" width="18" height="84" rx="6" fill="#a16207" />
      <rect x="146" y="82" width="16" height="72" rx="6" fill="#a16207" />
      <rect x="164" y="86" width="48" height="24" rx="8" fill="#f8fafc" />
      <Child
        x={224}
        y={112}
        scale={0.72}
        skin="#7c451f"
        hair="#1c1917"
        top="#f472b6"
        bottom="#f472b6"
        braids
      />
      <rect x="152" y="118" width="146" height="36" rx="8" fill="#a5b4fc" />
      <path d="M152 128h146" stroke="#818cf8" strokeWidth="3" />
    </Scene>
  );
}

function ClassroomUniformScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#fef9ef" />
      <rect y="140" width="320" height="60" fill="#e8c9a0" />
      <rect
        x="26"
        y="24"
        width="120"
        height="72"
        rx="6"
        fill="#166534"
        stroke="#854d0e"
        strokeWidth="5"
      />
      <text x="86" y="68" fill="#fef3c7" fontSize="22" fontWeight="700" textAnchor="middle">
        12 + 8 = 20
      </text>
      <rect
        x="182"
        y="34"
        width="106"
        height="62"
        rx="4"
        fill="#f1f5f9"
        stroke="#cbd5e1"
        strokeWidth="3"
      />
      <path
        d="M196 52h78M196 66h60M196 80h44"
        stroke="#cbd5e1"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="34" y="122" width="64" height="8" rx="3" fill="#d19a5b" />
      <rect x="40" y="130" width="7" height="26" fill="#b97f42" />
      <rect x="86" y="130" width="7" height="26" fill="#b97f42" />
      <rect x="222" y="122" width="64" height="8" rx="3" fill="#d19a5b" />
      <rect x="228" y="130" width="7" height="26" fill="#b97f42" />
      <rect x="274" y="130" width="7" height="26" fill="#b97f42" />
      <Child
        x={162}
        y={178}
        scale={1.05}
        skin="#7c451f"
        hair="#1c1917"
        top="#dbeafe"
        bottom="#1e3a8a"
        braids
      />
      <path d="M147 106h30v10h-30Z" fill="#1e3a8a" opacity=".35" />
    </Scene>
  );
}

function RoadToSchoolScene(props: SceneProps) {
  return (
    <Scene {...props}>
      <rect width="320" height="200" fill="#cfe9f7" />
      <circle cx="46" cy="38" r="18" fill="#fde68a" />
      <path d="M0 118c48-34 92-8 132-30 42-24 96-16 188 22v88H0Z" fill="#86c34a" />
      <path d="M180 100h96v48h-96Z" fill="#fef3c7" />
      <path d="M176 100l52-30 52 30Z" fill="#dc2626" />
      <rect x="216" y="118" width="24" height="30" fill="#7c3aed" />
      <rect x="190" y="112" width="18" height="16" fill="#bae6fd" />
      <rect x="250" y="112" width="18" height="16" fill="#bae6fd" />
      <path d="M0 200l64-58h72l-40 58Z" fill="#cbd5e1" />
      <path d="M62 186l10-14M84 160l8-12" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
      <Child
        x={62}
        y={192}
        scale={0.82}
        skin="#7c451f"
        hair="#1c1917"
        top="#dbeafe"
        bottom="#1e3a8a"
        braids
      />
      <Child
        x={112}
        y={186}
        scale={0.76}
        skin="#8d5524"
        hair="#2b1b12"
        top="#bbf7d0"
        bottom="#166534"
      />
      <g fill="#ffffff" opacity=".9">
        <ellipse cx="252" cy="40" rx="24" ry="13" />
        <ellipse cx="232" cy="44" rx="16" ry="9" />
      </g>
    </Scene>
  );
}

const sceneArt: Record<SceneArtKey, (props: SceneProps) => React.ReactElement> = {
  cat: CatScene,
  sun: SunScene,
  'boy-red-ball': BoyRedBallScene,
  'classroom-apple': ClassroomAppleScene,
  'boy-blue-bag': BoyBlueBagScene,
  farm: FarmScene,
  'bedroom-wake': BedroomWakeScene,
  'classroom-uniform': ClassroomUniformScene,
  'road-to-school': RoadToSchoolScene,
};

export function SceneArt({ art, className }: { art: SceneArtKey; className?: string }) {
  const Art = sceneArt[art];
  return <Art className={className} />;
}
