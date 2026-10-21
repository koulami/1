import { GameState } from '../types/game';

// Inline high-quality SVG graphic data URLs for instant, offline, robust asset rendering
export const SVG_IMAGES = {
beardedVulture: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="60%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
        <linearGradient id="mountain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="vultureChest" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#skyB)"/>
      <circle cx="500" cy="90" r="45" fill="#fef08a" opacity="0.8"/>
      <!-- Rugged Alpine Peaks -->
      <polygon points="0,400 120,220 230,310 380,180 500,280 600,200 600,400" fill="url(#mountain)"/>
      <polygon points="120,220 150,260 90,260" fill="#cbd5e1" opacity="0.8"/>
      <polygon points="380,180 410,230 350,230" fill="#cbd5e1" opacity="0.8"/>
      
      <!-- Soaring Bearded Vulture (Gypaetus barbatus) -->
      <!-- Pointed wings & Diamond-shaped wedge tail -->
      <g transform="translate(180, 70)">
        <!-- Left Wing (Long, narrow, falcon-like) -->
        <path d="M 120,80 Q 40,40 -40,30 Q 30,70 110,95 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
        <!-- Right Wing -->
        <path d="M 150,80 Q 230,40 310,30 Q 240,70 160,95 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
        <!-- Diamond Wedge Tail -->
        <polygon points="135,100 120,165 135,185 150,165" fill="#1e293b"/>
        <!-- Body with Rusty Orange Underside -->
        <ellipse cx="135" cy="85" rx="26" ry="18" fill="url(#vultureChest)"/>
        <!-- Head & Black Eye Mask & Chin Beard -->
        <circle cx="135" cy="65" r="14" fill="#fed7aa"/>
        <path d="M 125,62 Q 135,55 145,62 Q 135,70 125,62 Z" fill="#0f172a"/>
        <!-- Beard tuft -->
        <polygon points="133,75 137,75 135,84" fill="#0f172a"/>
        <!-- Beak -->
        <polygon points="131,58 139,58 135,48" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
      </g>
      <text x="24" y="375" font-family="sans-serif" font-weight="800" font-size="16" fill="#f8fafc">Γυπαετός (Gypaetus barbatus) - Ο Άρχοντας των Κορυφών</text>
    </svg>
  `)}`,

  griffonVulture: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0ea5e9"/>
          <stop offset="70%" stop-color="#e0f2fe"/>
          <stop offset="100%" stop-color="#fef9c3"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#skyG)"/>
      <!-- Thermal Updraft Spirals -->
      <path d="M 220,380 C 180,300 240,240 200,160 C 170,100 230,60 210,20" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6" fill="none" opacity="0.6"/>
      <path d="M 380,380 C 340,300 400,240 360,160 C 330,100 390,60 370,20" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6" fill="none" opacity="0.6"/>
      
      <!-- Canyon Cliffs -->
      <polygon points="0,400 140,260 170,400" fill="#78350f" opacity="0.9"/>
      <polygon points="450,400 480,240 600,400" fill="#78350f" opacity="0.9"/>
      
      <!-- Griffon Vulture (Gyps fulvus) Soaring -->
      <g transform="translate(170, 90)">
        <!-- Broad Rectangular Wings with Splayed Finger Primary Feathers -->
        <path d="M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z" fill="#92400e"/>
        <!-- Splayed primaries -->
        <path d="M -50,60 L -70,50 M -50,65 L -68,62 M -48,70 L -64,75" stroke="#451a03" stroke-width="4" stroke-linecap="round"/>
        
        <path d="M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z" fill="#92400e"/>
        <path d="M 330,60 L 350,50 M 330,65 L 348,62 M 328,70 L 344,75" stroke="#451a03" stroke-width="4" stroke-linecap="round"/>
        
        <!-- Short Square Tail -->
        <polygon points="128,95 118,140 162,140 152,95" fill="#451a03"/>
        <!-- Tawny Body -->
        <ellipse cx="140" cy="85" rx="22" ry="16" fill="#b45309"/>
        <!-- White Ruff Collar & Bare Pale Neck -->
        <circle cx="140" cy="74" r="10" fill="#f8fafc"/>
        <path d="M 138,70 Q 140,55 140,46" stroke="#fed7aa" stroke-width="6" stroke-linecap="round"/>
        <!-- Small Head & Hooked Beak -->
        <circle cx="140" cy="44" r="7" fill="#fed7aa"/>
        <polygon points="137,42 143,42 140,34" fill="#e2e8f0"/>
      </g>
      <text x="24" y="375" font-family="sans-serif" font-weight="800" font-size="16" fill="#451a03">Όρνιο (Gyps fulvus) - Ο Κυρίαρχος των Θερμών Ρευμάτων</text>
    </svg>
  `)}`,

  blackVulture: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="dadiaBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="60%" stop-color="#022c22"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#dadiaBg)"/>
      <!-- Dadia Black Pine Forest Silhouette -->
      <g fill="#022c22" stroke="#064e3b" stroke-width="2">
        <polygon points="40,400 80,180 120,400"/>
        <polygon points="110,400 160,140 210,400"/>
        <polygon points="200,400 240,220 280,400"/>
        <polygon points="380,400 440,130 500,400"/>
        <polygon points="490,400 540,190 590,400"/>
      </g>
      
      <!-- Giant Black Pine with Massive Nest -->
      <rect x="290" y="160" width="24" height="240" fill="#451a03"/>
      <!-- Nest Bowl on Pine Top -->
      <ellipse cx="302" cy="165" rx="65" ry="22" fill="#78350f" stroke="#292524" stroke-width="4"/>
      
      <!-- Black Vulture (Aegypius monachus) on Nest -->
      <g transform="translate(260, 60)">
        <!-- Massive Black-Brown Body -->
        <ellipse cx="42" cy="85" rx="30" ry="24" fill="#18181b"/>
        <!-- Folded Broad Wings -->
        <path d="M 20,70 Q 30,120 40,115 Q 60,120 65,70 Z" fill="#09090b"/>
        <!-- Pale Bluish-Grey Bare Head and Huge Bill -->
        <ellipse cx="42" cy="50" rx="12" ry="14" fill="#94a3b8"/>
        <!-- Powerful Dark Hooked Bill -->
        <path d="M 40,42 Q 52,38 46,55 Q 38,50 40,42 Z" fill="#0f172a" stroke="#475569"/>
        <!-- Dark Eye -->
        <circle cx="40" cy="48" r="3" fill="#facc15"/>
        <!-- Black ruff collar -->
        <ellipse cx="42" cy="64" rx="16" ry="6" fill="#18181b"/>
      </g>
      <text x="24" y="375" font-family="sans-serif" font-weight="800" font-size="16" fill="#f8fafc">Μαυρόγυπας (Aegypius monachus) - Ο Γίγαντας της Δαδιάς</text>
    </svg>
  `)}`,

  egyptianVulture: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="desertSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="60%" stop-color="#fed7aa"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#desertSky)"/>
      <circle cx="100" cy="90" r="40" fill="#fef08a" opacity="0.9"/>
      <!-- Sand Dunes / Mediterranean Hills -->
      <path d="M 0,340 Q 150,290 300,330 T 600,310 L 600,400 L 0,400 Z" fill="#d97706" opacity="0.7"/>
      <path d="M 0,360 Q 200,320 400,360 T 600,340 L 600,400 L 0,400 Z" fill="#b45309"/>
      
      <!-- Egyptian Vulture (Neophron percnopterus) -->
      <!-- Striking White body with Jet Black Flight Feathers & Yellow Face -->
      <g transform="translate(170, 70)">
        <!-- Black & White Wings -->
        <path d="M 120,80 Q 40,45 -30,40 Q 30,85 105,95 Z" fill="#f8fafc" stroke="#e2e8f0"/>
        <path d="M -30,40 Q 10,75 70,85 L 50,92 L -25,48 Z" fill="#0f172a"/>
        
        <path d="M 140,80 Q 220,45 290,40 Q 230,85 155,95 Z" fill="#f8fafc" stroke="#e2e8f0"/>
        <path d="M 290,40 Q 250,75 190,85 L 210,92 L 285,48 Z" fill="#0f172a"/>
        
        <!-- Wedge-shaped Pure White Tail -->
        <polygon points="120,95 130,145 140,95" fill="#f8fafc" stroke="#cbd5e1"/>
        <!-- White Body -->
        <ellipse cx="130" cy="85" rx="20" ry="14" fill="#f8fafc"/>
        <!-- Bare Bright Yellow Facial Mask & Spiky Crest -->
        <circle cx="130" cy="62" r="12" fill="#facc15"/>
        <polygon points="126,50 130,42 134,50" fill="#f8fafc"/>
        <polygon points="120,54 125,46 128,54" fill="#f8fafc"/>
        <!-- Slender Hooked Bill with Dark Tip -->
        <polygon points="128,62 132,62 130,50" fill="#facc15"/>
        <polygon points="129,52 131,52 130,48" fill="#0f172a"/>
      </g>
      <text x="24" y="375" font-family="sans-serif" font-weight="800" font-size="16" fill="#78350f">Ασπροπάρης (Neophron percnopterus) - Ο Σοφός Ταξιδιώτης</text>
    </svg>
  `)}`,

  feedingStation: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <rect width="600" height="400" fill="#0f172a"/>
      <!-- Fenced Vulture Restaurant Enclosure -->
      <line x1="80" y1="280" x2="520" y2="280" stroke="#94a3b8" stroke-width="4"/>
      <line x1="80" y1="240" x2="520" y2="240" stroke="#94a3b8" stroke-width="4"/>
      <!-- Fence Posts -->
      <line x1="120" y1="220" x2="120" y2="340" stroke="#cbd5e1" stroke-width="6"/>
      <line x1="220" y1="220" x2="220" y2="340" stroke="#cbd5e1" stroke-width="6"/>
      <line x1="320" y1="220" x2="320" y2="340" stroke="#cbd5e1" stroke-width="6"/>
      <line x1="420" y1="220" x2="420" y2="340" stroke="#cbd5e1" stroke-width="6"/>
      <!-- Sign Board -->
      <rect x="180" y="80" width="240" height="80" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="3"/>
      <text x="200" y="115" font-family="sans-serif" font-weight="bold" font-size="16" fill="#34d399">ΤΑΪΣΤΡΑ ΓΥΠΩΝ</text>
      <text x="200" y="140" font-family="sans-serif" font-size="13" fill="#cbd5e1">Vulture Restaurant</text>
      <!-- Safe Food Icon -->
      <circle cx="460" cy="120" r="30" fill="#10b981" opacity="0.2"/>
      <text x="448" y="130" font-size="28">🥩</text>
    </svg>
  `)}`,

  gpsTransmitter: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <rect width="600" height="400" fill="#020617"/>
      <!-- GPS Satellite in Orbit -->
      <circle cx="480" cy="90" r="28" fill="#0284c7" opacity="0.5"/>
      <rect x="460" y="75" width="40" height="30" rx="4" fill="#38bdf8"/>
      <!-- Solar Panels -->
      <rect x="420" y="82" width="35" height="16" fill="#0369a1" stroke="#38bdf8"/>
      <rect x="505" y="82" width="35" height="16" fill="#0369a1" stroke="#38bdf8"/>
      <!-- Signal Waves -->
      <path d="M 450,130 Q 300,200 200,250" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,6" fill="none"/>
      <!-- Transmitter Box on Harness -->
      <rect x="150" y="220" width="90" height="60" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="4"/>
      <!-- Mini Solar Panel on transmitter -->
      <rect x="165" y="232" width="60" height="36" fill="#0369a1"/>
      <!-- Antenna -->
      <line x1="230" y1="220" x2="280" y2="150" stroke="#f59e0b" stroke-width="3"/>
      <!-- Field Leg Ring with Code -->
      <rect x="170" y="310" width="50" height="30" rx="4" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
      <text x="180" y="330" font-family="monospace" font-weight="bold" font-size="14" fill="#0f172a">A31</text>
    </svg>
  `)}`,

  dogUnit: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <rect width="600" height="400" fill="#064e3b"/>
      <!-- Detection Dog Silhouette with Vest -->
      <circle cx="450" cy="100" r="40" fill="#10b981" opacity="0.2"/>
      <!-- Badge / Shield -->
      <polygon points="300,60 380,100 380,220 300,280 220,220 220,100" fill="#022c22" stroke="#10b981" stroke-width="4"/>
      <text x="245" y="160" font-family="sans-serif" font-weight="900" font-size="18" fill="#6ee7b7">K9 UNIT</text>
      <text x="235" y="195" font-family="sans-serif" font-weight="bold" font-size="12" fill="#a7f3d0">ΑΝΤΙΔΗΛΗΤΗΡΙΟ</text>
      <text x="240" y="220" font-size="34">🐕‍🦺</text>
    </svg>
  `)}`,

  cliffNest: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="gorge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#gorge)"/>
      <!-- Sheer Rock Face Cavity / Cave -->
      <path d="M 0,0 L 250,0 C 220,120 180,240 220,400 L 0,400 Z" fill="#334155"/>
      <path d="M 600,0 L 380,0 C 420,140 400,260 450,400 L 600,400 Z" fill="#334155"/>
      <!-- Cave Alcove -->
      <ellipse cx="210" cy="210" rx="60" ry="40" fill="#020617"/>
      <!-- Stick Nest in Cave with 1 White Egg -->
      <ellipse cx="210" cy="225" rx="45" ry="15" fill="#78350f"/>
      <ellipse cx="210" cy="222" rx="14" ry="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <text x="24" y="375" font-family="sans-serif" font-weight="bold" font-size="16" fill="#38bdf8">Φωλιά σε Σπηλιά Απόκρημνου Γκρεμού (1 Αυγό/έτος)</text>
    </svg>
  `)}`,

  
parthenon: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="70%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
        <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#sky)"/>
      <circle cx="480" cy="90" r="45" fill="#fef08a" opacity="0.8"/>
      <!-- Hill / Rock base -->
      <path d="M 0,320 Q 150,290 300,310 T 600,330 L 600,400 L 0,400 Z" fill="#64748b"/>
      <path d="M 50,330 Q 300,300 550,330 L 530,350 L 70,350 Z" fill="#475569"/>
      <!-- Acropolis Pediment & Columns -->
      <polygon points="120,180 300,120 480,180" fill="url(#marble)" stroke="#94a3b8" stroke-width="3"/>
      <rect x="110" y="180" width="380" height="24" rx="2" fill="url(#marble)" stroke="#94a3b8"/>
      <!-- Columns -->
      <g fill="url(#marble)" stroke="#94a3b8" stroke-width="2">
        <rect x="140" y="204" width="22" height="110" rx="3"/>
        <rect x="185" y="204" width="22" height="110" rx="3"/>
        <rect x="230" y="204" width="22" height="110" rx="3"/>
        <rect x="275" y="204" width="22" height="110" rx="3"/>
        <rect x="320" y="204" width="22" height="110" rx="3"/>
        <rect x="365" y="204" width="22" height="110" rx="3"/>
        <rect x="410" y="204" width="22" height="110" rx="3"/>
      </g>
      <!-- Base steps -->
      <rect x="115" y="314" width="370" height="14" rx="2" fill="url(#marble)" stroke="#94a3b8"/>
      <rect x="95" y="328" width="410" height="16" rx="2" fill="url(#marble)" stroke="#94a3b8"/>
    </svg>
  `)}`,

  chameleon: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#022c22"/>
        </linearGradient>
        <linearGradient id="cham" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="50%" stop-color="#06b6d4"/>
          <stop offset="100%" stop-color="#84cc16"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#bg)"/>
      <!-- Tropical branch -->
      <path d="M 20,290 C 180,270 360,280 580,240" stroke="#78350f" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M 20,290 C 180,270 360,280 580,240" stroke="#a16207" stroke-width="18" fill="none" stroke-linecap="round"/>
      <!-- Chameleon Body -->
      <ellipse cx="280" cy="220" rx="100" ry="60" fill="url(#cham)"/>
      <circle cx="370" cy="190" r="45" fill="url(#cham)"/>
      <!-- Eye -->
      <circle cx="380" cy="185" r="20" fill="#facc15" stroke="#047857" stroke-width="5"/>
      <circle cx="385" cy="185" r="7" fill="#0f172a"/>
      <!-- Curl tail -->
      <path d="M 180,230 C 130,220 100,260 120,295 C 135,320 170,305 160,280 C 152,265 138,275 142,285" fill="none" stroke="url(#cham)" stroke-width="22" stroke-linecap="round"/>
      <!-- Legs gripping branch -->
      <path d="M 240,260 L 235,280 L 250,285" stroke="#047857" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M 330,250 L 335,270 L 350,275" stroke="#047857" stroke-width="12" fill="none" stroke-linecap="round"/>
      <!-- Crest -->
      <polygon points="330,150 350,170 380,145 400,165" fill="#facc15"/>
    </svg>
  `)}`,

  treasureMap: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
      <defs>
        <linearGradient id="parchment" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="50%" stop-color="#fde68a"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#parchment)"/>
      <!-- Ocean Waves & Grid -->
      <path d="M 0,0 L 600,0 L 600,400 L 0,400 Z" fill="none" stroke="#b45309" stroke-width="6"/>
      <line x1="150" y1="10" x2="150" y2="390" stroke="#d97706" stroke-width="1" stroke-dasharray="8 8" opacity="0.6"/>
      <line x1="300" y1="10" x2="300" y2="390" stroke="#d97706" stroke-width="1" stroke-dasharray="8 8" opacity="0.6"/>
      <line x1="450" y1="10" x2="450" y2="390" stroke="#d97706" stroke-width="1" stroke-dasharray="8 8" opacity="0.6"/>
      <!-- Islands -->
      <path d="M 70,120 Q 120,60 210,90 T 260,180 Q 200,240 120,210 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="4"/>
      <path d="M 360,200 Q 420,150 510,180 T 540,290 Q 460,340 370,300 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="4"/>
      <path d="M 330,80 Q 380,50 420,70 T 400,120 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="3"/>
      <!-- Red Dotted Trail -->
      <path d="M 160,150 C 240,110 320,160 370,140 C 430,120 440,220 460,260" fill="none" stroke="#dc2626" stroke-width="4" stroke-dasharray="8 8"/>
      <!-- Big Red X Marks the Spot -->
      <line x1="440" y1="240" x2="480" y2="280" stroke="#dc2626" stroke-width="8" stroke-linecap="round"/>
      <line x1="480" y1="240" x2="440" y2="280" stroke="#dc2626" stroke-width="8" stroke-linecap="round"/>
      <!-- Compass Rose -->
      <g transform="translate(100, 310)">
        <circle cx="0" cy="0" r="32" fill="#fffbeb" stroke="#b45309" stroke-width="2"/>
        <polygon points="0,-28 6,-6 28,0 6,6 0,28 -6,6 -28,0 -6,-6" fill="#b45309"/>
        <polygon points="0,-28 0,0 28,0" fill="#dc2626"/>
        <text x="-4" y="-34" font-family="sans-serif" font-weight="bold" font-size="12" fill="#78350f">N</text>
      </g>
      <!-- Title banner -->
      <text x="210" y="42" font-family="serif" font-weight="bold" font-size="22" fill="#78350f" letter-spacing="3">MYSTIC QUEST MAP</text>
    </svg>
  `)}`,

  telescope: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <rect width="300" height="300" rx="16" fill="#0f172a"/>
      <circle cx="210" cy="70" r="35" fill="#facc15" opacity="0.9"/>
      <path d="M 50,260 L 150,150 L 170,165 L 70,275 Z" fill="#64748b"/>
      <polygon points="120,170 230,80 250,95 140,185" fill="#38bdf8"/>
      <line x1="150" y1="160" x2="100" y2="280" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
      <line x1="150" y1="160" x2="150" y2="280" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
      <line x1="150" y1="160" x2="200" y2="280" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `)}`,

  microscope: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <rect width="300" height="300" rx="16" fill="#0f172a"/>
      <rect x="70" y="240" width="160" height="30" rx="8" fill="#475569"/>
      <path d="M 120,240 C 110,180 140,110 200,90" fill="none" stroke="#64748b" stroke-width="18" stroke-linecap="round"/>
      <polygon points="140,70 190,40 205,65 155,95" fill="#10b981"/>
      <rect x="110" y="150" width="80" height="12" rx="4" fill="#cbd5e1"/>
      <circle cx="150" cy="156" r="14" fill="#38bdf8" opacity="0.8"/>
    </svg>
  `)}`,

  compass: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <rect width="300" height="300" rx="16" fill="#0f172a"/>
      <circle cx="150" cy="150" r="100" fill="#1e293b" stroke="#f59e0b" stroke-width="10"/>
      <circle cx="150" cy="150" r="85" fill="#0f172a" stroke="#cbd5e1" stroke-width="3"/>
      <polygon points="150,65 165,150 135,150" fill="#ef4444"/>
      <polygon points="150,235 165,150 135,150" fill="#94a3b8"/>
      <circle cx="150" cy="150" r="10" fill="#f59e0b"/>
      <text x="144" y="90" font-family="sans-serif" font-weight="bold" font-size="18" fill="#ef4444">N</text>
    </svg>
  `)}`,

  atom: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
      <rect width="300" height="300" rx="16" fill="#0f172a"/>
      <circle cx="150" cy="150" r="22" fill="#8b5cf6"/>
      <ellipse cx="150" cy="150" rx="100" ry="38" fill="none" stroke="#06b6d4" stroke-width="5" transform="rotate(0 150 150)"/>
      <ellipse cx="150" cy="150" rx="100" ry="38" fill="none" stroke="#06b6d4" stroke-width="5" transform="rotate(60 150 150)"/>
      <ellipse cx="150" cy="150" rx="100" ry="38" fill="none" stroke="#06b6d4" stroke-width="5" transform="rotate(120 150 150)"/>
      <circle cx="250" cy="150" r="8" fill="#facc15"/>
      <circle cx="100" cy="64" r="8" fill="#facc15"/>
      <circle cx="100" cy="236" r="8" fill="#facc15"/>
    </svg>
  `)}`

};

export const EPIC_CHALLENGE_GAME_STATE: GameState = {
  id: 'arena-session-1',
  title: 'BoundPad Epic Challenge',
  description: 'Διαδραστικό κυνήγι γνώσης & δεξιοτήτων ομάδων',
  title_en: 'BoundPad Epic Challenge',
  description_en: 'Interactive Team Knowledge & Skills Quest',
  phase: 'waiting_lobby',
  synthesisPrompt: 'Συνθέστε τα συμπεράσματα, τα στοιχεία και τις πληροφορίες που αντλήσατε από τις αποστολές για τη συζήτηση στην τάξη:',
  synthesisPrompt_en: 'Synthesize your findings, evidence, and discoveries from the quests for the classroom discussion:',
  synthesisNotes: [],
  activeRound: 1,
  updatedAt: Date.now(),
  timer: {
    totalSeconds: 1200, // 20 minutes default
    remainingSeconds: 1200,
    isRunning: false,
    updatedAt: Date.now()
  },
  teams: [
    {
      id: 'team-alpha',
      name: 'Ομάδα Α: Οι Εξερευνητές',
      name_en: 'Team A: The Explorers',
      color: '#10b981', // Emerald
      avatar: '🧭',
      slogan: 'Ανακαλύπτουμε τα πάντα!',
      slogan_en: 'Discovering everything!'
    },
    {
      id: 'team-beta',
      name: 'Ομάδα Β: Οι Καινοτόμοι',
      name_en: 'Team B: The Innovators',
      color: '#06b6d4', // Cyan
      avatar: '⚡',
      slogan: 'Ταχύτητα και σκέψη!',
      slogan_en: 'Speed and intellect!'
    },
    {
      id: 'team-gamma',
      name: 'Ομάδα Γ: Οι Ταξιδιώτες',
      name_en: 'Team C: The Voyagers',
      color: '#f59e0b', // Amber
      avatar: '🚀',
      slogan: 'Στοχεύουμε στα αστέρια!',
      slogan_en: 'Aiming for the stars!'
    },
    {
      id: 'team-delta',
      name: 'Ομάδα Δ: Οι Επιστήμονες',
      name_en: 'Team D: The Scientists',
      color: '#8b5cf6', // Purple
      avatar: '🔬',
      slogan: 'Η λογική κερδίζει!',
      slogan_en: 'Logic prevails!'
    }
  ],
  questions: [
    {
      id: 'quest-1',
      title: 'Κουίζ με Φωτογραφία: Ιστορικό Μνημείο',
      title_en: 'Photo Quiz: Historic Monument',
      description: 'Παρατηρήστε την εικόνα και επιλέξτε το σωστό μνημείο της αρχαίας κλασικής εποχής.',
      description_en: 'Observe the image and select the correct monument from classical antiquity.',
      type: 'multiple_choice',
      points: 100,
      imageUrl: SVG_IMAGES.parthenon,
      assignedTeamIds: ['team-alpha', 'team-gamma', 'team-delta'],
      payload: {
        options: [
          'Ο Παρθενώνας στην Ακρόπολη Αθηνών',
          'Το Κολοσσαίο στη Ρώμη',
          'Ο Ναός του Απόλλωνα στους Δελφούς',
          'Η Πύλη του Βρανδεμβούργου'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'The Parthenon on the Acropolis of Athens',
          'The Colosseum in Rome',
          'The Temple of Apollo in Delphi',
          'The Brandenburg Gate'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Ο Παρθενώνας κατασκευάστηκε τον 5ο αιώνα π.Χ. προς τιμήν της θεάς Αθηνάς.',
      explanation_en: 'The Parthenon was built in the 5th century BC in honour of the goddess Athena.'
    },
    {
      id: 'quest-2',
      title: 'Σωστό ή Λάθος: Βιολογία & Φύση',
      title_en: 'True or False: Biology & Nature',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό σχετικά με τη συμπεριφορά του χαμαιλέοντα.',
      description_en: 'Evaluate the following claim regarding chameleon behaviour: "Chameleons change colour exclusively for camouflage to hide from predators."',
      type: 'true_false',
      points: 80,
      imageUrl: SVG_IMAGES.chameleon,
      assignedTeamIds: ['team-beta', 'team-delta'],
      payload: {
        correctValue: false
      },
      payload_en: {
        correctValue: false
      },
      explanation: 'Λάθος! Οι χαμαιλέοντες αλλάζουν χρώμα κυρίως για επικοινωνία, ρύθμιση θερμοκρασίας και διάθεση, και όχι αποκλειστικά για καμουφλάζ.',
      explanation_en: 'False! Chameleons change colour primarily for communication, temperature regulation, and mood, rather than solely for camouflage.'
    },
    {
      id: 'quest-3',
      title: 'Αντιστοίχιση Κειμένου: Πρωτεύουσες Ευρώπης',
      title_en: 'Text Matching: European Capitals',
      description: 'Αντιστοιχίστε κάθε χώρα με τη σωστή πρωτεύουσά της.',
      description_en: 'Match each country with its correct capital city.',
      type: 'text_match',
      points: 120,
      assignedTeamIds: ['team-alpha', 'team-beta'],
      payload: {
        pairs: [
          { id: 'p1', left: 'Ελλάδα', right: 'Αθήνα' },
          { id: 'p2', left: 'Γαλλία', right: 'Παρίσι' },
          { id: 'p3', left: 'Ιταλία', right: 'Ρώμη' },
          { id: 'p4', left: 'Πορτογαλία', right: 'Λισαβόνα' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'p1', left: 'Greece', right: 'Athens' },
          { id: 'p2', left: 'France', right: 'Paris' },
          { id: 'p3', left: 'Italy', right: 'Rome' },
          { id: 'p4', left: 'Portugal', right: 'Lisbon' }
        ]
      }
    },
    {
      id: 'quest-4',
      title: 'Αντιστοίχιση Εικόνας με Κείμενο: Επιστημονικά Όργανα',
      title_en: 'Image-to-Text Matching: Scientific Instruments',
      description: 'Συνδέστε κάθε εικόνα επιστημονικού οργάνου με το αντίστοιχο όνομα και πεδίο χρήσης.',
      description_en: 'Match each scientific instrument image with its name and field of application.',
      type: 'image_match',
      points: 150,
      assignedTeamIds: ['team-gamma', 'team-delta'],
      payload: {
        pairs: [
          { id: 'im1', image: SVG_IMAGES.telescope, text: 'Τηλεσκόπιο (Αστρονομία & Παρατήρηση Διαστήματος)' },
          { id: 'im2', image: SVG_IMAGES.microscope, text: 'Μικροσκόπιο (Βιολογία & Κυτταρική Έρευνα)' },
          { id: 'im3', image: SVG_IMAGES.compass, text: 'Πυξίδα (Προσανατολισμός & Γεωγραφία)' },
          { id: 'im4', image: SVG_IMAGES.atom, text: 'Μοντέλο Ατόμου (Κβαντική & Πυρηνική Φυσική)' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'im1', image: SVG_IMAGES.telescope, text: 'Telescope (Astronomy & Space Observation)' },
          { id: 'im2', image: SVG_IMAGES.microscope, text: 'Microscope (Biology & Cellular Research)' },
          { id: 'im3', image: SVG_IMAGES.compass, text: 'Compass (Orientation & Geography)' },
          { id: 'im4', image: SVG_IMAGES.atom, text: 'Atom Model (Quantum & Nuclear Physics)' }
        ]
      }
    },
    {
      id: 'quest-5',
      title: 'Σκανάρισμα QR Code: Μυστικός Σταθμός',
      title_en: 'QR Code Hunt: Secret Station',
      description: 'Βρείτε το QR Code του πρώτου σταθμού (κωδικός: BOUND-ALPHA-2026), σαρώστε το με την κάμερα ή πληκτρολογήστε τον κωδικό σταθμού.',
      description_en: 'Find the QR Code for Station 1 (passcode: BOUND-ALPHA-2026), scan it with the camera, or enter the station passcode.',
      type: 'qr_scan',
      points: 150,
      assignedTeamIds: ['team-alpha', 'team-delta'],
      payload: {
        targetCode: 'BOUND-ALPHA-2026',
        locationHint: 'Ο σταθμός βρίσκεται στον κεντρικό πίνακα ή στην κάρτα σταθμών του διαχειριστή.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.treasureMap,
          title: 'Χάρτης Κρυμμένου Θησαυρού',
          caption: 'Συγχαρητήρια! Ξεκλειδώσατε τον ιστορικό χάρτη της αποστολής. Μελετήστε τα σημεία ενδιαφέροντος για το επόμενο στάδιο.'
        }
      },
      payload_en: {
        targetCode: 'BOUND-ALPHA-2026',
        locationHint: 'The station is located on the main board or on the facilitator station card.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.treasureMap,
          title: 'Hidden Treasure Map',
          caption: 'Congratulations! You unlocked the historical expedition map. Study the points of interest for the next phase.'
        }
      }
    },
    {
      id: 'quest-6',
      title: 'Δημιουργική Αποστολή: Ομαδική Φωτογραφία',
      title_en: 'Creative Challenge: Team Photo',
      description: 'Βγάλτε μία διασκεδαστική ομαδική φωτογραφία όπου όλα τα μέλη σχηματίζουν ένα γράμμα ή δείχνουν με χαμόγελο προς την κάμερα!',
      description_en: 'Take a fun team photograph where all members form a letter or smile toward the camera!',
      type: 'photo_upload',
      points: 180,
      assignedTeamIds: ['team-beta', 'team-gamma'],
      payload: {
        instructions: 'Χρησιμοποιήστε την κάμερα του κινητού ή υπολογιστή ή ανεβάστε μια πρόσφατη φωτογραφία της ομάδας σας.'
      },
      payload_en: {
        instructions: 'Use your device camera or upload a recent photo of your team.'
      }
    },
    {
      id: 'quest-text-quiz',
      title: 'Κουίζ Γνώσεων: Το Μεγαλύτερο Θηλαστικό (Χωρίς Φωτογραφία)',
      title_en: 'Knowledge Quiz: The Largest Mammal',
      description: 'Ποιο από τα παρακάτω είναι το μεγαλύτερο ζώο που έχει ζήσει ποτέ στον πλανήτη Γη;',
      description_en: 'Which of the following is the largest animal ever known to have lived on planet Earth?',
      type: 'multiple_choice',
      points: 100,
      assignedTeamIds: ['team-beta', 'team-alpha'],
      payload: {
        options: [
          'Η Γαλάζια Φάλαινα (Balaenoptera musculus)',
          'Ο Αφρικανικός Ελέφαντας',
          'Ο Μεγαλόδοντας',
          'Ο Τυραννόσαυρος Ρεξ'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'The Blue Whale (Balaenoptera musculus)',
          'The African Elephant',
          'The Megalodon',
          'The Tyrannosaurus Rex'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Η γαλάζια φάλαινα μπορεί να φτάσει σε μήκος τα 30 μέτρα και βάρος τους 190 τόνους!',
      explanation_en: 'The blue whale can reach up to 30 metres in length and weigh as much as 190 tonnes!'
    },
    {
      id: 'quest-text-tf',
      title: 'Σωστό ή Λάθος: Ηλιακό Σύστημα (Χωρίς Φωτογραφία)',
      title_en: 'True or False: Solar System',
      description: 'Η Γη χρειάζεται περίπου 365 ημέρες και 6 ώρες για να ολοκληρώσει μία πλήρη περιφορά γύρω από τον Ήλιο.',
      description_en: 'Earth takes approximately 365 days and 6 hours to complete one full revolution around the Sun.',
      type: 'true_false',
      points: 90,
      assignedTeamIds: ['team-gamma', 'team-delta'],
      payload: {
        correctValue: true
      },
      payload_en: {
        correctValue: true
      },
      explanation: 'Σωστό! Για τον λόγο αυτό προσθέτουμε μία επιπλέον ημέρα κάθε τέσσερα έτη (δίσεκτο έτος).',
      explanation_en: 'True! This is why we add an extra day every four years (leap year).'
    },
    {
      id: 'quest-7',
      title: 'Παζλ Εικόνας: Ο Χάρτης των Θησαυρών',
      title_en: 'Jigsaw Puzzle: Treasure Map',
      description: 'Ανασυνθέστε την εικόνα ενώνοντας τα κομμάτια! Μπορείτε να επιλέξετε 4, 6 ή 9 κομμάτια.',
      description_en: 'Reconstruct the image by connecting the pieces! You can choose 4, 6, or 9 pieces.',
      type: 'puzzle',
      points: 200,
      imageUrl: SVG_IMAGES.treasureMap,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        imageUrl: SVG_IMAGES.treasureMap,
        gridPieces: 6 // 6 pieces (3x2) default, selectable 4, 6, 9
      },
      payload_en: {
        imageUrl: SVG_IMAGES.treasureMap,
        gridPieces: 6
      }
    },
    {
      id: 'quest-8',
      title: 'Αποστολή Πεδίου: Έρευνα & Συνεργασία',
      title_en: 'Field Mission: Research & Collaboration',
      description: 'Εκτελέστε τα βήματα της αποστολής με την ομάδα σας, σημειώστε τα ευρήματα και υποβάλετε την αναφορά σας!',
      description_en: 'Execute the mission steps with your team, record your findings, and submit your report!',
      type: 'task',
      points: 220,
      imageUrl: SVG_IMAGES.compass,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        instructions: 'Εντοπίστε 3 ιστορικά ή επιστημονικά στοιχεία στον χώρο, καταγράψτε τα και υποβάλετε την αναφορά και φωτογραφία της ομάδας!',
        checklist: [
          'Βήμα 1: Συγκέντρωση της ομάδας & ανάθεση ρόλων',
          'Βήμα 2: Εντοπισμός και καταγραφή των 3 στοιχείων',
          'Βήμα 3: Σύνταξη σύντομης αναφοράς και λήψη τελικής φωτογραφίας'
        ],
        requiresEvidence: 'both',
        completionPrompt: 'Γράψτε εδώ τη σύντομη αναφορά των ευρημάτων σας:'
      },
      payload_en: {
        instructions: 'Locate 3 historical or scientific artifacts in the area, document them, and submit your team report and photo!',
        checklist: [
          'Step 1: Gather the team & assign roles',
          'Step 2: Locate and document the 3 elements',
          'Step 3: Write a brief summary report and take a final team photo'
        ],
        requiresEvidence: 'both',
        completionPrompt: 'Enter your brief report of findings here:'
      },
      explanation: 'Εξαιρετική ομαδική συνεργασία και επιτυχής ολοκλήρωση αποστολής πεδίου!',
      explanation_en: 'Outstanding teamwork and successful completion of the field mission!'
    },
    {
      id: 'quest-delta-mc',
      title: 'Κουίζ Πολλαπλής Επιλογής: Επιστημονική Μέθοδος & Έρευνα',
      title_en: 'Multiple Choice Quiz: Scientific Method & Research',
      description: 'Ποιες από τις παρακάτω προτάσεις ισχύουν για την επιστημονική μέθοδο και τα πειράματα; (Προσοχή: Υπάρχουν περισσότερες από μία σωστές απαντήσεις!)',
      description_en: 'Which of the following statements apply to the scientific method and experiments? (Note: More than one answer is correct!)',
      type: 'multiple_choice',
      points: 140,
      imageUrl: SVG_IMAGES.telescope,
      assignedTeamIds: ['team-delta', 'team-beta'],
      payload: {
        options: [
          'Ένα επιστημονικό πείραμα πρέπει να μπορεί να επαναληφθεί από άλλους ερευνητές',
          'Μια επιστημονική υπόθεση ελέγχεται πάντα με παρατηρήσεις, δεδομένα και δοκιμές',
          'Μια επιστημονική θεωρία δεν επιτρέπεται ποτέ να αμφισβητηθεί ή να τροποποιηθεί',
          'Τα αποτελέσματα καταγράφονται αντικειμενικά με μετρήσεις και στοιχεία'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0, 1, 3]
      },
      payload_en: {
        options: [
          'A scientific experiment must be reproducible by other researchers',
          'A hypothesis is always tested with observations, data, and tests',
          'A scientific theory can never be challenged or modified',
          'Results are recorded objectively using measurements and evidence'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0, 1, 3]
      },
      explanation: 'Σωστά! Η επιστημονική μέθοδος βασίζεται στην επαναληψιμότητα, τον έλεγχο υποθέσεων και τις αντικειμενικές μετρήσεις. Οι επιστημονικές θεωρίες εξελίσσονται διαρκώς όταν προκύπτουν νέα δεδομένα.',
      explanation_en: 'Correct! The scientific method relies on repeatability, hypothesis testing, and objective measurements. Scientific theories constantly evolve as new evidence emerges.'
    },
    {
      id: 'quest-delta-station',
      title: 'Σταθμός QR Εργαστηρίου: Μυστικό Πείραμα',
      title_en: 'Laboratory QR Station: Secret Experiment',
      description: 'Βρείτε το QR Code του εργαστηρίου της 4ης ομάδας (κωδικός: LAB-DELTA-2026), σαρώστε το με την κάμερα για να ξεκλειδώσετε το επιστημονικό υλικό!',
      description_en: 'Find the 4th team laboratory QR Code (passcode: LAB-DELTA-2026), scan it with the camera to unlock the scientific material!',
      type: 'qr_scan',
      points: 150,
      assignedTeamIds: ['team-delta', 'team-alpha'],
      payload: {
        targetCode: 'LAB-DELTA-2026',
        locationHint: 'Ο σταθμός βρίσκεται στον πάγκο εργαστηρίου ή στην κάρτα επιστημών της 4ης ομάδας.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.atom,
          title: 'Μοντέλο Ατόμου & Εργαστηριακό Υλικό',
          caption: 'Συγχαρητήρια στην Ομάδα Δ! Ξεκλειδώσατε το επιστημονικό μοντέλο του εργαστηρίου.'
        }
      },
      payload_en: {
        targetCode: 'LAB-DELTA-2026',
        locationHint: 'The station is located at the laboratory bench or on the 4th team science card.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.atom,
          title: 'Atomic Model & Laboratory Material',
          caption: 'Congratulations to Team D! You unlocked the laboratory scientific model.'
        }
      }
    },
    {
      id: 'quest-delta-match',
      title: 'Αντιστοίχιση Κειμένου: Σπουδαίες Επιστημονικές Ανακαλύψεις',
      title_en: 'Text Matching: Great Scientific Discoveries',
      description: 'Συνδέστε κάθε σπουδαίο επιστήμονα με την ιστορική ανακάλυψη ή αρχή που διατύπωσε!',
      description_en: 'Match each renowned scientist with their historical discovery or formulated principle!',
      type: 'text_match',
      points: 130,
      imageUrl: SVG_IMAGES.microscope,
      assignedTeamIds: ['team-delta'],
      payload: {
        pairs: [
          { id: 'p-newton', left: 'Ισαάκ Νεύτων', right: 'Νόμος της Παγκόσμιας Έλξης' },
          { id: 'p-curie', left: 'Μαρία Κιουρί', right: 'Ραδιενέργεια & Στοιχεία Ράδιο/Πολώνιο' },
          { id: 'p-einstein', left: 'Άλμπερτ Αϊνστάιν', right: 'Θεωρία της Σχετικότητας' },
          { id: 'p-archimedes', left: 'Αρχιμήδης', right: 'Αρχή της Άνωσης & Υδροστατική' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'p-newton', left: 'Isaac Newton', right: 'Law of Universal Gravitation' },
          { id: 'p-curie', left: 'Marie Curie', right: 'Radioactivity & Radium/Polonium Elements' },
          { id: 'p-einstein', left: 'Albert Einstein', right: 'Theory of Relativity' },
          { id: 'p-archimedes', left: 'Archimedes', right: 'Principle of Buoyancy & Hydrostatics' }
        ]
      },
      explanation: 'Εξαιρετικά! Και οι τέσσερις ανακαλύψεις άλλαξαν ριζικά την πορεία της ανθρώπινης επιστήμης και τεχνολογίας.',
      explanation_en: 'Superb! All four discoveries fundamentally transformed human science and technology.'
    },
    {
      id: 'quest-delta-creative',
      title: 'Δημιουργική Αποστολή: Το Σύμβολο των Επιστημόνων',
      title_en: "Creative Challenge: The Scientists' Emblem",
      description: 'Βγάλτε μία διασκεδαστική ομαδική φωτογραφία όπου όλα τα μέλη συνεργάζονται σαν ερευνητική ομάδα εργαστηρίου ή σχηματίζουν με τα χέρια τους το σύμβολο του ατόμου!',
      description_en: 'Take a fun team photo where all members collaborate like a laboratory research squad or form an atom symbol with their hands!',
      type: 'photo_upload',
      points: 160,
      imageUrl: SVG_IMAGES.atom,
      assignedTeamIds: ['team-delta'],
      payload: {
        instructions: 'Χρησιμοποιήστε την κάμερα του υπολογιστή/κινητού ή ανεβάστε μια φωτογραφία της Ομάδας Δ εν δράσει!'
      },
      payload_en: {
        instructions: 'Use your device camera or upload a photo of Team D in action!'
      },
      explanation: 'Η φωτογραφία της Ομάδας Δ κατοχυρώθηκε με επιτυχία στο αρχείο ερευνών!',
      explanation_en: "Team D's photograph was successfully registered in the research archive!"
    }
  ],
  submissions: {}
};


export const VULTURES_GAME_STATE: GameState = {
  id: 'vultures-arena-31',
  title: 'Αποστολή: Οι 4 Γύπες της Ελλάδας - BoundPad Vulture Arena',
  description: 'Διαδραστικό εκπαιδευτικό παιχνίδι 31 αποστολών για τα Όρνια, τους Γυπαετούς, τους Μαυρόγυπες και τους Ασπροπάρηδες. Ανακαλύψτε τη βιολογία, τις απειλές και τη διατήρησή τους.',
  title_en: 'Mission: The 4 Vultures of Greece - BoundPad Vulture Arena',
  description_en: 'Interactive 31-quest educational arena exploring Griffon, Bearded, Black, and Egyptian Vultures. Discover their biology, threats, and conservation.',
  phase: 'waiting_lobby',
  synthesisPrompt: 'Συνθέστε τα στοιχεία που συλλέξατε για τα Όρνια, τους Γυπαετούς, τους Μαυρόγυπες και τους Ασπροπάρηδες. Ποιες είναι οι 3 πιο κρίσιμες δράσεις για να σωθούν οι γύπες της Ελλάδας;',
  synthesisPrompt_en: 'Synthesize the clues and discoveries gathered about the 4 vulture species. What are the 3 most critical actions needed to save the vultures of Greece?',
  synthesisNotes: [],
  activeRound: 1,
  updatedAt: Date.now(),
  timer: {
    totalSeconds: 1500, // 25 minutes default for 31 quests
    remainingSeconds: 1500,
    isRunning: false,
    updatedAt: Date.now()
  },
  teams: [
    {
      id: 'team-alpha',
      name: 'Ομάδα 1: Οι Γυπαετοί (Κοκκαλάδες)',
      name_en: 'Team 1: The Bearded Vultures (Lammergeiers)',
      color: '#f97316', // Orange / Rust
      avatar: '🦅',
      slogan: 'Κυρίαρχοι των ψηλών κορυφών & των φαραγγιών!',
      slogan_en: 'Lords of the high peaks and alpine gorges!'
    },
    {
      id: 'team-beta',
      name: 'Ομάδα 2: Τα Όρνια (Όρνια Κρήτης & Πίνδου)',
      name_en: 'Team 2: The Griffon Vultures',
      color: '#10b981', // Emerald
      avatar: '🪶',
      slogan: 'Αετομάτηδες στα θερμά ανοδικά ρεύματα!',
      slogan_en: 'Eagle-eyed navigators of thermal updrafts!'
    },
    {
      id: 'team-gamma',
      name: 'Ομάδα 3: Οι Μαυρόγυπες (Γίγαντες της Δαδιάς)',
      name_en: 'Team 3: The Black Vultures (Giants of Dadia)',
      color: '#06b6d4', // Cyan
      avatar: '🌲',
      slogan: 'Φύλακες του αρχέγονου δάσους!',
      slogan_en: 'Guardians of the ancient forest!'
    },
    {
      id: 'team-delta',
      name: 'Ομάδα 4: Οι Ασπροπάρηδες (Ταξιδιώτες του Νείλου)',
      name_en: 'Team 4: The Egyptian Vultures (Nile Voyagers)',
      color: '#8b5cf6', // Purple
      avatar: '🌍',
      slogan: 'Ευφυΐα και διηπειρωτικά ταξίδια!',
      slogan_en: 'Intelligence and intercontinental journeys!'
    }
  ],
  questions: [
    // 1
    {
      id: 'vulture-quest-1',
      title: 'Τα 4 Είδη Γυπών της Ελλάδας & της Ευρώπης',
      title_en: 'The 4 Vulture Species of Greece & Europe',
      description: 'Ποια είναι τα 4 μοναδικά είδη γυπών που ζουν και αναπαράγονται στην Ελλάδα και την υπόλοιπη Ευρώπη;',
      description_en: 'What are the 4 unique vulture species that live and breed in Greece and the rest of Europe?',
      type: 'multiple_choice',
      points: 100,
      imageUrl: SVG_IMAGES.griffonVulture,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        options: [
          'Όρνιο, Γυπαετός, Μαυρόγυπας, Ασπροπάρης',
          'Χρυσαετός, Σπιζαετός, Θαλασσαετός, Φιδαετός',
          'Κοράκι, Κίσσα, Καλιακούδα, Κορακοειδές',
          'Πελαργός, Ερωδιός, Κορμοράνος, Πελεκάνος'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'Griffon Vulture, Bearded Vulture, Black Vulture, Egyptian Vulture',
          'Golden Eagle, Bonelli Eagle, White-tailed Eagle, Short-toed Snake Eagle',
          'Raven, Jay, Chough, Magpie',
          'White Stork, Heron, Cormorant, Pelican'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Στην Ελλάδα και την Ευρώπη επιβιώνουν μόνο 4 είδη γυπών: το Όρνιο (Gyps fulvus), ο Γυπαετός (Gypaetus barbatus), ο Μαυρόγυπας (Aegypius monachus) και ο Ασπροπάρης (Neophron percnopterus).',
      explanation_en: 'In Greece and Europe only 4 vulture species survive: the Griffon Vulture (Gyps fulvus), Bearded Vulture (Gypaetus barbatus), Black Vulture (Aegypius monachus), and Egyptian Vulture (Neophron percnopterus).'
    },

    // 2
    {
      id: 'vulture-quest-2',
      title: 'Σωστό ή Λάθος: Ο Κοκκαλάς και η Διατροφή με Οστά',
      title_en: 'True or False: The Bone-Eating Lammergeier',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό σχετικά με τη διατροφή του Γυπαετού (Gypaetus barbatus).',
      description_en: 'Evaluate the following statement regarding the diet of the Bearded Vulture (Gypaetus barbatus): "It is the only bird in the world whose diet consists of 70-90% bones."',
      type: 'true_false',
      points: 90,
      imageUrl: SVG_IMAGES.beardedVulture,
      assignedTeamIds: ['team-alpha', 'team-delta'],
      payload: {
        correctValue: true
      },
      payload_en: {
        correctValue: true
      },
      explanation: 'Σωστό! Ο Γυπαετός (γνωστός στην Κρήτη ως «Κοκκαλάς») είναι το μοναδικό σπονδυλωτό ζώο του οποίου η διατροφή αποτελείται κατά 70-90% από κόκαλα, τα οποία σπάει ρίχνοντάς τα από 50-80 μέτρα ύψος πάνω σε απόκρημνες βραχώδεις σάρες (σπαστήρες).',
      explanation_en: 'True! The Bearded Vulture (known in Crete as "Kokkalas") is the only vertebrate animal whose diet consists of 70-90% bones, which it breaks by dropping them from 50-80 metres onto rocky ossuaries (choppers).'
    },

    // 3
    {
      id: 'vulture-quest-3',
      title: 'Αντιστοίχιση: Επιστημονική Ονομασία των 4 Γυπών',
      title_en: 'Matching: Scientific Names of the 4 Vultures',
      description: 'Αντιστοιχίστε το κοινό ελληνικό όνομα κάθε γύπα με την επίσημη λατινική επιστημονική ονομασία του.',
      description_en: 'Match the common name of each vulture with its official Latin scientific binomial name.',
      type: 'text_match',
      points: 120,
      assignedTeamIds: ['team-alpha', 'team-beta'],
      payload: {
        pairs: [
          { id: 'p1', left: 'Όρνιο', right: 'Gyps fulvus' },
          { id: 'p2', left: 'Γυπαετός', right: 'Gypaetus barbatus' },
          { id: 'p3', left: 'Μαυρόγυπας', right: 'Aegypius monachus' },
          { id: 'p4', left: 'Ασπροπάρης', right: 'Neophron percnopterus' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'p1', left: 'Griffon Vulture', right: 'Gyps fulvus' },
          { id: 'p2', left: 'Bearded Vulture', right: 'Gypaetus barbatus' },
          { id: 'p3', left: 'Black / Cinereous Vulture', right: 'Aegypius monachus' },
          { id: 'p4', left: 'Egyptian Vulture', right: 'Neophron percnopterus' }
        ]
      },
      explanation: 'Η ταξινομική διάκριση δείχνει ότι κάθε γύπας ανήκει σε διαφορετικό γένος, έχοντας εξειδικευτεί σε ξεχωριστό οικολογικό ρόλο.',
      explanation_en: 'The taxonomic classification shows that each species belongs to a distinct genus, adapted to a specialized ecological niche.'
    },

    // 4
    {
      id: 'vulture-quest-4',
      title: 'Αναγνώριση Σιλουέτας & Χαρακτηριστικών Πτήσης',
      title_en: 'Flight Silhouette & Identification Characteristics',
      description: 'Συνδέστε κάθε είδος γύπα με το διακριτικό σχήμα της ουράς και των φτερών του στον ουρανό.',
      description_en: 'Match each vulture species with its distinctive tail shape and wing silhouette in the sky.',
      type: 'image_match',
      points: 130,
      imageUrl: SVG_IMAGES.griffonVulture,
      assignedTeamIds: ['team-beta', 'team-gamma'],
      payload: {
        pairs: [
          { id: 'sm1', image: SVG_IMAGES.beardedVulture, text: 'Γυπαετός: Μακριά φτερά και ρομβοειδής σφηνοειδής ουρά σαν διαμάντι' },
          { id: 'sm2', image: SVG_IMAGES.griffonVulture, text: 'Όρνιο: Πολύ φαρδιά φτερά με βαθιά «δάχτυλα» και πολύ κοντή ουρά' },
          { id: 'sm3', image: SVG_IMAGES.blackVulture, text: 'Μαυρόγυπας: Τεράστια μονοκόμματα ορθογώνια φτερά (άνοιγμα ~3 μέτρα)' },
          { id: 'sm4', image: SVG_IMAGES.egyptianVulture, text: 'Ασπροπάρης: Λευκό σώμα, μαύρες άκρες φτερών και λευκή τριγωνική ουρά' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'sm1', image: SVG_IMAGES.beardedVulture, text: 'Bearded Vulture: Long wings and diamond wedge-shaped tail' },
          { id: 'sm2', image: SVG_IMAGES.griffonVulture, text: 'Griffon Vulture: Broad wings with deep splayed fingers and very short tail' },
          { id: 'sm3', image: SVG_IMAGES.blackVulture, text: 'Black Vulture: Massive rectangular dark wings (wingspan ~3 metres)' },
          { id: 'sm4', image: SVG_IMAGES.egyptianVulture, text: 'Egyptian Vulture: White body, black wingtips, and triangular white tail' }
        ]
      },
      explanation: 'Η σιλουέτα πτήσης επιτρέπει στους ορνιθολόγους να αναγνωρίζουν τους γύπες από χιλιόμετρα μακριά.',
      explanation_en: 'Flight silhouettes allow ornithologists to identify vulture species from kilometres away.'
    },

    // 5
    {
      id: 'vulture-quest-5',
      title: 'Ο Γίγαντας του Δάσους της Δαδιάς',
      title_en: 'The Giant of Dadia Forest',
      description: 'Ποιο είδος γύπα έχει άνοιγμα φτερών σχεδόν 3 μέτρα και φωλιάζει αποκλειστικά στις κορυφές των πανύψηλων μαύρων πεύκων στο Εθνικό Πάρκο Δάσους Δαδιάς στον Έβρο;',
      description_en: 'Which vulture species has a wingspan of nearly 3 metres and nests exclusively on top of massive black pine trees in Dadia National Park, Evros?',
      type: 'multiple_choice',
      points: 110,
      imageUrl: SVG_IMAGES.blackVulture,
      assignedTeamIds: ['team-gamma', 'team-delta'],
      payload: {
        options: [
          'Ο Μαυρόγυπας (Aegypius monachus)',
          'Ο Γυπαετός (Gypaetus barbatus)',
          'Το Όρνιο (Gyps fulvus)',
          'Ο Χρυσαετός (Aquila chrysaetos)'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'The Black Vulture / Cinereous Vulture (Aegypius monachus)',
          'The Bearded Vulture (Gypaetus barbatus)',
          'The Griffon Vulture (Gyps fulvus)',
          'The Golden Eagle (Aquila chrysaetos)'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Το Δάσος της Δαδιάς φιλοξενεί τη μοναδική αναπαραγόμενη αποικία Μαυρόγυπα στα Βαλκάνια. Οι φωλιές τους στις κορυφές των μαύρων και τραχειών πεύκων φτάνουν σε διάμετρο έως και τα 2 μέτρα!',
      explanation_en: 'Dadia Forest hosts the only breeding colony of Black Vultures in the Balkans. Their nests atop black pines can reach up to 2 metres in diameter!'
    },

    // 6
    {
      id: 'vulture-quest-6',
      title: 'Σωστό ή Λάθος: Ο Ασπροπάρης και η Χρήση Εργαλείων',
      title_en: 'True or False: Egyptian Vulture Tool Use',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό σχετικά με την ευφυΐα του Ασπροπάρη (Neophron percnopterus).',
      description_en: 'Evaluate the claim: "The Egyptian Vulture is one of the very few birds known to use tools, picking up stones in its beak to smash thick eggs."',
      type: 'true_false',
      points: 100,
      imageUrl: SVG_IMAGES.egyptianVulture,
      assignedTeamIds: ['team-delta', 'team-beta'],
      payload: {
        correctValue: true
      },
      payload_en: {
        correctValue: true
      },
      explanation: 'Σωστό! Ο Ασπροπάρης είναι παγκοσμίως διάσημος ως ένα από τα σπάνια είδη πουλιών που χρησιμοποιεί εργαλεία: μαζεύει πέτρες με το ράμφος του και τις εκσφενδονίζει με δύναμη για να σπάσει χοντρά αυγά άλλων πουλιών (όπως στρουθοκαμήλων στην Αφρική).',
      explanation_en: 'True! The Egyptian Vulture is world-renowned as one of the few bird species that uses tools: it holds stones in its beak and hurls them repeatedly to crack open thick bird eggs.'
    },

    // 7
    {
      id: 'vulture-quest-7',
      title: 'Το Μυστικό του Πορτοκαλί Φτερώματος του Γυπαετού',
      title_en: 'Secret of the Bearded Vulture Rusty Plumage',
      description: 'Από πού προέρχεται το εντυπωσιακό πορτοκαλί-κοκκινωπό χρώμα στο στήθος και την κοιλιά του ενήλικου Γυπαετού;',
      description_en: 'Where does the striking orange-rusty coloration on the breast and underbelly of adult Bearded Vultures come from?',
      type: 'multiple_choice',
      points: 110,
      imageUrl: SVG_IMAGES.beardedVulture,
      assignedTeamIds: ['team-alpha', 'team-gamma'],
      payload: {
        options: [
          'Κάνει ενεργητικά «λουτρά» σε λάσπη και νερό πλούσιο σε οξείδια σιδήρου (ώχρα)',
          'Από το αίμα των ζώων που τρέφεται',
          'Είναι το φυσικό γενετικό χρώμα των φτερών του χωρίς καμία εξωτερική επίδραση',
          'Από την έκθεση στις υπεριώδεις ακτίνες του ηλίου στις κορυφές'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'It deliberately bathes in mud and spring water rich in iron oxides (ochre)',
          'From the blood of the animals it feeds on',
          'It is the natural genetic feather pigmentation without external influence',
          'From high-altitude ultraviolet sun radiation on alpine peaks'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Τα φτερά του γυπαετού είναι φυσικά λευκά! Τα πουλιά κάνουν επίτηδες καλλωπιστικά λουτρά σε πηγές πλούσιες σε οξείδια σιδήρου, βάφοντας τα φτερά τους πορτοκαλί. Όσο πιο πορτοκαλί είναι ένα πουλί, τόσο υψηλότερο κοινωνικό status εκπέμπει.',
      explanation_en: 'The feathers are naturally white! The birds deliberately bathe in iron oxide-rich mud springs, dyeing their plumage orange. Deeper orange indicates higher social dominance and territorial experience.'
    },

    // 8
    {
      id: 'vulture-quest-8',
      title: 'Παζλ: Το Όρνιο σε Ανοδικά Θερμά Ρεύματα',
      title_en: 'Puzzle: Griffon Vulture in Thermal Updrafts',
      description: 'Συναρμολογήστε το παζλ που αναπαριστά το Όρνιο να γλιστρά αβίαστα πάνω από τα απόκρημνα φαράγγια χωρίς να χτυπά τα φτερά του.',
      description_en: 'Assemble the puzzle depicting the Griffon Vulture effortlessly soaring over rugged gorges without flapping its wings.',
      type: 'puzzle',
      points: 120,
      imageUrl: SVG_IMAGES.griffonVulture,
      assignedTeamIds: ['team-beta', 'team-alpha'],
      payload: {
        gridPieces: 9,
        imageUrl: SVG_IMAGES.griffonVulture
      },
      payload_en: {
        gridPieces: 9,
        imageUrl: SVG_IMAGES.griffonVulture
      },
      explanation: 'Τα όρνια χρησιμοποιούν τα θερμά ανοδικά ρεύματα αέρα (thermals) για να ανυψώνονται κυκλικά έως και 3.000 μέτρα, εξοικονομώντας ενέργεια καθώς μπορούν να διανύσουν 200+ χιλιόμετρα ημερησίως για αναζήτηση τροφής!',
      explanation_en: 'Griffons utilize rising thermal air currents to spiral up to 3,000 metres, conserving energy and covering over 200 km per day in search of food!'
    },

    // 9
    {
      id: 'vulture-quest-9',
      title: 'Οι Καθαριστές της Φύσης: Δημόσια Υγεία & Οικοσύστημα',
      title_en: 'Nature Sanitizers: Public Health & Ecosystem Services',
      description: 'Ποια είναι η πιο ανεκτίμητη οικολογική υπηρεσία που προσφέρουν οι γύπες στον άνθρωπο και στο φυσικό περιβάλλον;',
      description_en: 'What is the most invaluable ecological service that vultures provide to humanity and the natural environment?',
      type: 'multiple_choice',
      points: 120,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        options: [
          'Καθαρίζουν ταχύτατα τη φύση από ψοφίμια, εμποδίζοντας τη διάδοση άνθρακα, λύσσας και χολέρας',
          'Επικονιάζουν τα φυτά των ορεινών όγκων',
          'Φτιάχνουν φωλιές που χρησιμοποιούνται από άλλα είδη πουλιών',
          'Μειώνουν τον πληθυσμό των επιβλαβών εντόμων στα δάση'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'Rapidly sanitize nature by consuming carcasses, preventing deadly anthrax, rabies, and cholera outbreaks',
          'Pollinate high-altitude mountain vegetation',
          'Build nests subsequently reused by songbirds',
          'Control agricultural pest insects in mountain forests'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Οι γύπες είναι οι απόλυτοι υγειονομικοί καθαριστές της φύσης. Χωρίς αυτούς, τα νεκρά ζώα αποσυντίθενται αργά, μολύνοντας τον υδροφόρο ορίζοντα και πολλαπλασιάζοντας επικίνδυνα παθογόνα βακτήρια και αδέσποτα ζώα με λύσσα.',
      explanation_en: 'Vultures are nature sanitation officers. Without them, carcasses rot slowly, contaminating water sources and multiplying lethal bacteria and rabid feral animals.'
    },

    // 10
    {
      id: 'vulture-quest-10',
      title: 'Σωστό ή Λάθος: Το Πανίσχυρο Όξινο Στομάχι των Γυπών',
      title_en: 'True or False: The Super-Acidic Vulture Stomach',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό σχετικά με το πεπτικό σύστημα των γυπών.',
      description_en: 'Evaluate the claim: "Vulture gastric stomach acid is so acidic (pH close to 1, similar to battery acid) that it can neutralize deadly bacteria like anthrax and botulism."',
      type: 'true_false',
      points: 90,
      assignedTeamIds: ['team-beta', 'team-gamma'],
      payload: {
        correctValue: true
      },
      payload_en: {
        correctValue: true
      },
      explanation: 'Σωστό! Το στομάχι των γυπών έχει pH κοντά στο 1 (τόσο όξινο όσο το οξύ μπαταρίας αυτοκινήτου). Μπορεί να διαλύσει ακόμη και πυκνά οστά και εξολοθρεύει τα περισσότερα θανατηφόρα βακτήρια, καθιστώντας τους γύπες άτρωτους σε ασθένειες που θα σκότωναν άλλα ζώα.',
      explanation_en: 'True! Vulture gastric acid has a pH near 1 (comparable to car battery acid). It digests dense bones and destroys nearly all lethal microorganisms, rendering vultures immune to pathogens.'
    },

    // 11
    {
      id: 'vulture-quest-11',
      title: 'Η «Ιεραρχία στο Τραπέζι»: Ποιος τρώει τι;',
      title_en: 'Carcass Dining Hierarchy: Who Eats What?',
      description: 'Αντιστοιχίστε το κάθε είδος γύπα με το συγκεκριμένο μέρος του κουφαριού που καταναλώνει χάρη στην εξειδίκευση του ράμφους του.',
      description_en: 'Match each vulture species with the specific part of the carcass it consumes due to its specialized bill morphology.',
      type: 'text_match',
      points: 130,
      assignedTeamIds: ['team-gamma', 'team-alpha'],
      payload: {
        pairs: [
          { id: 'h1', left: 'Μαυρόγυπας (Ισχυρό ράμφος)', right: 'Σκληρό δέρμα, χόνδροι και τένοντες (ανοίγει το κουφάρι)' },
          { id: 'h2', left: 'Όρνιο (Μακρύς γυμνός λαιμός)', right: 'Μαλακό κρέας και εσωτερικά σπλάχνα' },
          { id: 'h3', left: 'Γυπαετός (Εξειδικευμένο στομάχι)', right: 'Οστά που καταπίνει ολόκληρα ή σπάει στα βράχια' },
          { id: 'h4', left: 'Ασπροπάρης (Λεπτό ράμφος)', right: 'Μικρά υπολείμματα, έντομα και μικρά κομμάτια' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'h1', left: 'Black Vulture (Powerful heavy bill)', right: 'Tough hide, skin, cartilage, and tendons (opens the carcass)' },
          { id: 'h2', left: 'Griffon Vulture (Long bare neck)', right: 'Soft muscle meat and internal viscera' },
          { id: 'h3', left: 'Bearded Vulture (Specialized stomach)', right: 'Bones swallowed whole or dropped on rocks' },
          { id: 'h4', left: 'Egyptian Vulture (Slender forceps bill)', right: 'Scraps, small meat fragments, and insects' }
        ]
      },
      explanation: 'Η τέλεια οικολογική συνεργασία! Κανένα είδος δεν ανταγωνίζεται ευθέως το άλλο: ο Μαυρόγυπας ανοίγει το σκληρό τομάρι, τα Όρνια τρώνε το κρέας, ο Γυπαετός καθαρίζει τα κόκαλα και ο Ασπροπάρης μαζεύει τα τελευταία ψίχουλα.',
      explanation_en: 'Flawless ecological synergy! They do not compete directly: Black Vultures tear the tough hide, Griffons strip the flesh, Bearded Vultures consume the bones, and Egyptian Vultures glean the remaining crumbs.'
    },

    // 12
    {
      id: 'vulture-quest-12',
      title: 'Αποστολή Πεδίου: Τροφικό Πλέγμα & Παραδοσιακή Κτηνοτροφία',
      title_en: 'Field Task: Food Web & Pastoral Livestock Farming',
      description: 'Επιβεβαιώστε τα 4 κρίσιμα στοιχεία που συνδέουν την παραδοσιακή εκτατική κτηνοτροφία με την επιβίωση των γυπών στην ελληνική ύπαιθρο.',
      description_en: 'Confirm the 4 critical elements linking traditional extensive pastoralism with the survival of vultures in the Greek countryside.',
      type: 'task',
      points: 120,
      assignedTeamIds: ['team-delta', 'team-alpha'],
      payload: {
        instructions: 'Ελέγξτε προσεκτικά κάθε σημείο και σημειώστε τα ως ολοκληρωμένα:',
        checklist: [
          'Κοπάδια αιγοπροβάτων που βόσκουν ελεύθερα στα βουνά (φυσική πηγή τροφής)',
          'Απουσία δηλητηριασμένων δολωμάτων και φολών στους βοσκότοπους',
          'Μη χρήση τοξικών κτηνιατρικών φαρμάκων (δικλοφενάκη) στα ζώα',
          'Συνεργασία κτηνοτρόφων με τις δασικές υπηρεσίες και ορνιθολογικές οργανώσεις'
        ],
        completionPrompt: 'Επιβεβαιώστε ότι η ομάδα σας κατανόησε τη σημασία της εκτατικής κτηνοτροφίας για τους γύπες.'
      },
      payload_en: {
        instructions: 'Carefully review each point and mark them completed:',
        checklist: [
          'Free-ranging flocks of sheep and goats grazing in mountains (natural food source)',
          'Complete absence of illegal poison baits in pastoral pastures',
          'Non-use of toxic veterinary drugs (diclofenac) in livestock',
          'Active collaboration between pastoralists, forest services, and conservation NGOs'
        ],
        completionPrompt: 'Confirm that your team understands the synergy between extensive pastoralism and vultures.'
      },
      explanation: 'Οι γύπες της Ευρώπης συνδέονται άρρηκτα εδώ και χιλιετίες με την παραδοσιακή κτηνοτροφία. Η εγκατάλειψη της ορεινής υπαίθρου στερεί από τους γύπες τη βασική τους πηγή τροφής.',
      explanation_en: 'European vultures have been inextricably linked with traditional extensive pastoralism for millennia. Rural abandonment deprives them of essential foraging opportunities.'
    },

    // 13
    {
      id: 'vulture-quest-13',
      title: 'Η Εξελικτική Προσαρμογή του Γυμνού Λαιμού στο Όρνιο',
      title_en: 'Evolutionary Adaptation of the Bare Neck in Griffons',
      description: 'Για ποιο λόγο το Όρνιο έχει μακρύ λαιμό χωρίς πυκνά φτερά, καλυμμένο μόνο με λεπτό χνούδι;',
      description_en: 'Why does the Griffon Vulture have a long neck devoid of dense contour feathers, covered only in fine down?',
      type: 'multiple_choice',
      points: 100,
      imageUrl: SVG_IMAGES.griffonVulture,
      assignedTeamIds: ['team-beta', 'team-alpha'],
      payload: {
        options: [
          'Για να διατηρείται καθαρός όταν βυθίζει το κεφάλι του βαθιά μέσα στο κουφάρι χωρίς να λερώνει φτερά',
          'Για να πετάει με μεγαλύτερη ταχύτητα στον αέρα',
          'Γιατί έχασε τα φτερά του από επιθέσεις αρπακτικών',
          'Για να τρομάζει τους ανταγωνιστές του στο έδαφος'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'To maintain hygiene when probing deep inside carcasses without blood clotting on feathers',
          'To achieve higher aerodynamic airspeed in flight',
          'Because feathers were lost during battles with ground predators',
          'To intimidate rival scavengers on the ground'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Εάν ο λαιμός είχε κανονικά φτερά, το αίμα και τα υπολείμματα τροφής θα κολλούσαν, προκαλώντας βακτηριακές λοιμώξεις. Το γυμνό δέρμα καθαρίζεται πανεύκολα και απολυμαίνεται από την ηλιακή ακτινοβολία όταν το πουλί λιάζεται!',
      explanation_en: 'If feathered, blood and viscera would coagulate, inducing lethal bacterial infections. Bare skin is easily cleaned and sterilized by solar UV radiation as the bird sunbathes.'
    },

    // 14
    {
      id: 'vulture-quest-14',
      title: 'Σωστό ή Λάθος: Θηρευτές ή Αυστηρά Πτωματοφάγοι;',
      title_en: 'True or False: Predators or Obligate Scavengers?',
      description: 'Εξετάστε τον μύθο: «Οι γύπες συχνά επιτίθενται και σκοτώνουν υγιή ζωντανά πρόβατα και μοσχάρια.»',
      description_en: 'Evaluate the myth: "Vultures frequently attack and kill healthy living sheep and calves in the mountains."',
      type: 'true_false',
      points: 90,
      assignedTeamIds: ['team-alpha', 'team-gamma'],
      payload: {
        correctValue: false
      },
      payload_en: {
        correctValue: false
      },
      explanation: 'Λάθος! Είναι ένας επιβλαβής μύθος. Οι γύπες είναι «υποχρεωτικοί πτωματοφάγοι» (obligate scavengers). Τα νύχια των ποδιών τους είναι κοντά, αμβλέα και αδύναμα (σαν της κότας) — δεν μπορούν να πιάσουν ή να σκοτώσουν ζωντανό υγιές ζώο, παρά μόνο να τραφούν από ήδη νεκρά κουφάρια.',
      explanation_en: 'False! This is a harmful rural myth. Vultures are obligate scavengers. Their talons are flat, blunt, and weak like a chicken — physically incapable of grasping or killing healthy livestock.'
    },

    // 15
    {
      id: 'vulture-quest-15',
      title: 'Η Υπ’ Αριθμόν 1 Απειλή: Δηλητηριασμένα Δολώματα (Φόλες)',
      title_en: 'Threat Number One: Illegal Poison Baits',
      description: 'Ποια είναι η κυριότερη αιτία που οδήγησε τους γύπες στα πρόθυρα της εξαφάνισης στην ηπειρωτική Ελλάδα και τα Βαλκάνια;',
      description_en: 'What is the primary factor that drove vultures to the verge of regional extinction across mainland Greece and the Balkans?',
      type: 'multiple_choice',
      points: 130,
      imageUrl: SVG_IMAGES.dogUnit,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        options: [
          'Η παράνομη διασπορά δηλητηριασμένων δολωμάτων (φόλες) στην ύπαιθρο',
          'Η φυσική γήρανση των πουλιών',
          'Ο ανταγωνισμός από τα κοράκια',
          'Η έλλειψη νερού στα βουνά'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'The illegal placement of poisoned baits in the countryside targeting carnivores',
          'Natural senescence and aging of birds',
          'Competition from common ravens',
          'Lack of drinking water in mountain streams'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Τα δηλητηριασμένα δολώματα που τοποθετούνται παράνομα στην ύπαιθρο (συχνά για λύκους, αλεπούδες ή αδέσποτα) είναι καταστροφικά. Επειδή τα Όρνια τρέφονται ομαδικά, ένα και μόνο δηλητηριασμένο ζώο μπορεί να σκοτώσει σε μία ώρα 10, 20 ή και ολόκληρη την τοπική αποικία!',
      explanation_en: 'Poison baits illegally placed for wolves or foxes are catastrophic. Because Griffon Vultures feed communally, a single poisoned carcass can annihilate 10, 20, or an entire regional breeding colony within hours!'
    },

    // 16
    {
      id: 'vulture-quest-16',
      title: 'Σωστό ή Λάθος: Το Κτηνιατρικό Φάρμακο Δικλοφενάκη',
      title_en: 'True or False: The Veterinary Drug Diclofenac',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό σχετικά με τις επιπτώσεις φαρμάκων στους γύπες.',
      description_en: 'Evaluate the claim: "The veterinary use of the anti-inflammatory drug diclofenac in livestock wiped out 99% of Asian vultures due to kidney failure within a single decade."',
      type: 'true_false',
      points: 100,
      assignedTeamIds: ['team-beta', 'team-delta'],
      payload: {
        correctValue: true
      },
      payload_en: {
        correctValue: true
      },
      explanation: 'Σωστό! Η χρήση δικλοφενάκης σε αγελάδες στην Ινδία οδήγησε στη μεγαλύτερη κατάρρευση πληθυσμού πτηνών στην ιστορία (εξαφανίστηκαν πάνω από 40 εκατομμύρια γύπες!). Στην Ευρώπη δίνεται μεγάλος αγώνας για την πλήρη απαγόρευση επικίνδυνων κτηνιατρικών φαρμάκων.',
      explanation_en: 'True! Veterinary diclofenac administered to cattle caused the fastest avian population crash in human history (over 40 million vultures died from visceral gout). Strict European regulations now fight to ban harmful veterinary NSAIDs.'
    },

    // 17
    {
      id: 'vulture-quest-17',
      title: 'Αντιστοίχιση Ανθρωπογενών Απειλών & Επιπτώσεων',
      title_en: 'Matching Anthropogenic Threats & Conservation Impacts',
      description: 'Συνδέστε κάθε απειλή με τον συγκεκριμένο τρόπο που πλήττει τους γύπες.',
      description_en: 'Match each anthropogenic threat with the exact mechanism by which it harms vultures.',
      type: 'text_match',
      points: 120,
      assignedTeamIds: ['team-gamma', 'team-beta'],
      payload: {
        pairs: [
          { id: 't1', left: 'Δηλητηριασμένα δολώματα (φόλες)', right: 'Μαζική θανάτωση δεκάδων ατόμων σε ένα μόνο γεύμα' },
          { id: 't2', left: 'Μη μονωμένοι πυλώνες ρεύματος', right: 'Ηλεκτροπληξία κατά την προσγείωση μεγάλων πουλιών' },
          { id: 't3', left: 'Αιολικά πάρκα σε διάδρομους πτήσης', right: 'Θανάσιμη πρόσκρουση στις περιστρεφόμενες πτέρυγες' },
          { id: 't4', left: 'Σκάγια μολύβδου (κυνήγι)', right: 'Χρόνια δηλητηρίαση (μολυβδίαση) από κατάποση μολύβδου' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 't1', left: 'Illegal poison baits', right: 'Mass mortality of dozens of birds at a single meal' },
          { id: 't2', left: 'Uninsulated medium-voltage pylons', right: 'Electrocution when large wings bridge live wires' },
          { id: 't3', left: 'Wind turbines in flight corridors', right: 'Fatal collision with rapidly rotating turbine blades' },
          { id: 't4', left: 'Lead ammunition (hunting)', right: 'Chronic lead intoxication (plumbism) from bullet fragments' }
        ]
      },
      explanation: 'Η αντιμετώπιση των απειλών απαιτεί μόνωση πυλώνων, αυστηρό έλεγχο χωροθέτησης αιολικών και απαγόρευση μολύβδινων σκαγιών.',
      explanation_en: 'Mitigating threats requires pylon insulation retrofitting, micro-siting of wind parks, and banning toxic lead ammunition.'
    },

    // 18
    {
      id: 'vulture-quest-18',
      title: 'Οι Ειδικές Αντιδηλητηριαστικές Ομάδες Σκύλων (K9 Units)',
      title_en: 'Specialized Anti-Poison Dog Units (K9 Units)',
      description: 'Ποιος είναι ο ρόλος των ειδικά εκπαιδευμένων σκύλων ανίχνευσης που δραστηριοποιούνται στη Θράκη, την Κρήτη και την Ήπειρο;',
      description_en: 'What is the vital role of the specialized conservation detection dogs operating in Thrace, Crete, and Epirus?',
      type: 'multiple_choice',
      points: 110,
      imageUrl: SVG_IMAGES.dogUnit,
      assignedTeamIds: ['team-alpha', 'team-gamma'],
      payload: {
        options: [
          'Εντοπίζουν με την όσφρησή τους δηλητηριασμένα δολώματα στην ύπαιθρο πριν προλάβουν να τα φάνε οι γύπες',
          'Φυλάνε τις φωλιές των γυπών από επιθέσεις αλεπούδων',
          'Κυνηγούν τα κοράκια που κλέβουν την τροφή των γυπών',
          'Οδηγούν τους γύπες προς τις ασφαλείς ταΐστρες'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'Sniff out and locate illegal poisoned baits and carcasses in the wilderness before vultures consume them',
          'Guard vulture cliff nests against terrestrial predators',
          'Chase ravens competing for food carcasses',
          'Guide vultures towards artificial feeding stations'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Οι Αντιδηλητηριαστικές Ομάδες Σκύλων της Ελληνικής Ορνιθολογικής Εταιρείας και του WWF σώζουν δεκάδες γύπες κάθε χρόνο, απομακρύνοντας έγκαιρα το δηλητήριο από τα βουνά.',
      explanation_en: 'The Canine Anti-Poison Units of the Hellenic Ornithological Society and WWF Greece save dozens of vultures every year by rapidly neutralizing poison in mountain habitats.'
    },

    // 19
    {
      id: 'vulture-quest-19',
      title: 'Φωτογραφική Αποστολή: Εντοπισμός Βιοτόπου ή Απειλής',
      title_en: 'Photo Quest: Habitat Clue or Threat Identification',
      description: 'Φωτογραφίστε ένα στοιχείο του περιβάλλοντος (π.χ. πυλώνα ρεύματος, απόκρημνο βράχο, δασικό τοπίο, πηγή νερού) και ανεβάστε το με μια σύντομη περιγραφή.',
      description_en: 'Photograph an environmental feature (e.g. power pylon, rocky cliff, mountain terrain, or water spring) and submit it with a brief commentary.',
      type: 'photo_upload',
      points: 140,
      assignedTeamIds: ['team-delta', 'team-beta'],
      payload: {
        instructions: 'Τραβήξτε και ανεβάστε μία καθαρή φωτογραφία που σχετίζεται με τον βιότοπο ή τους κινδύνους των γυπών.'
      },
      payload_en: {
        instructions: 'Take and upload a clear photograph representing either vulture habitat, feeding grounds, or potential hazards.'
      },
      explanation: 'Η φωτογραφική καταγραφή και η επιτόπια παρατήρηση είναι θεμέλιος λίθος για τη χαρτογράφηση κρίσιμων βιοτόπων.',
      explanation_en: 'Field photo-documentation is fundamental for mapping critical vulture habitats and power line danger zones.'
    },

    // 20
    {
      id: 'vulture-quest-20',
      title: 'Σωστό ή Λάθος: Αναπαραγωγικός Ρυθμός και Αυγά',
      title_en: 'True or False: Reproduction Rate and Eggs',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό: «Οι γύπες γεννούν πολλά αυγά (5-8 αυγά) κάθε χρόνο, επομένως οι πληθυσμοί τους μπορούν να ανακάμψουν μέσα σε λίγους μήνες.»',
      description_en: 'Evaluate the claim: "Vultures lay large clutches of 5-8 eggs every year, which is why their depleted colonies recover within a few months."',
      type: 'true_false',
      points: 90,
      imageUrl: SVG_IMAGES.cliffNest,
      assignedTeamIds: ['team-alpha', 'team-gamma'],
      payload: {
        correctValue: false
      },
      payload_en: {
        correctValue: false
      },
      explanation: 'Λάθος! Οι γύπες έχουν εξαιρετικά αργό αναπαραγωγικό ρυθμό (K-strategy): γεννούν ΜΟΝΟ 1 αυγό το χρόνο (σπανιότατα 2 ο Ασπροπάρης), το κλωσούν για σχεδόν 2 μήνες, το μικρό μένει στη φωλιά 4 μήνες και ωριμάζει σεξουαλικά στα 5-7 έτη! Γι’ αυτό η απώλεια έστω και ενός ενήλικου πουλιού είναι τεράστιο πλήγμα.',
      explanation_en: 'False! Vultures are classic K-strategists: they lay ONLY 1 egg per year (rarely 2 for Egyptian Vultures), incubate for nearly 2 months, rear the chick for 4 months, and reach maturity at 5-7 years! Losing even one adult bird severely compromises colony viability.'
    },

    // 21
    {
      id: 'vulture-quest-21',
      title: 'Δορυφορικοί Πομποί GPS & Τηλεμετρία Υψηλής Ακρίβειας',
      title_en: 'Satellite GPS Transmitters & High-Precision Telemetry',
      description: 'Πώς έχουν αλλάξει οι σύγχρονοι δορυφορικοί πομποί GPS/GSM στην πλάτη των γυπών την έρευνα και την προστασία τους;',
      description_en: 'How have modern lightweight solar GPS/GSM satellite transmitters harnessed onto vultures revolutionized research and anti-poison alerts?',
      type: 'multiple_choice',
      points: 120,
      imageUrl: SVG_IMAGES.gpsTransmitter,
      assignedTeamIds: ['team-beta', 'team-gamma', 'team-delta'],
      payload: {
        options: [
          'Στέλνουν σε πραγματικό χρόνο τις συντεταγμένες πτήσης, ταχύτητα, ύψος και άμεση ειδοποίηση (alert) αν ένα πουλί ακινητοποιηθεί ύποπτα',
          'Εκπέμπουν ήχους που τρομάζουν τους λαθροκυνηγούς',
          'Τροφοδοτούν το πουλί με ηλεκτρική ενέργεια όταν κουράζεται',
          'Εμποδίζουν τον γύπα να πετάξει εκτός των ορίων του εθνικού πάρκου'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'Transmit real-time GPS coordinates, flight altitude, speed, and immediate immobility alerts if a bird suddenly stops moving',
          'Emit loud acoustic sirens that scare away poachers',
          'Supply the vulture with electrical stamina when tired',
          'Physically constrain the vulture inside national park boundaries'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Η δορυφορική τηλεμετρία επιτρέπει στους επιστήμονες να εντοπίσουν ένα δηλητηριασμένο πουλί μέσα σε λίγες ώρες, σώζοντας τόσο το ίδιο όσο και απομακρύνοντας το δηλητήριο πριν σκοτωθούν κι άλλοι γύπες.',
      explanation_en: 'Satellite telemetry allows scientists to pinpoint an incapacitated bird within hours, saving the individual and eradicating the bait before it wipes out flock mates.'
    },

    // 22
    {
      id: 'vulture-quest-22',
      title: 'QR Σταθμός: Ταΐστρα Γυπών (Vulture Restaurant)',
      title_en: 'QR Station: Vulture Restaurant Feeding Site',
      description: 'Εντοπίστε και σκανάρετε το QR Code του Σταθμού Τροφοδοσίας Γυπών για να καταγράψετε την παροχή ασφαλούς τροφής.',
      description_en: 'Locate and scan the QR Code of the Vulture Feeding Station to record secure, toxin-free food provisioning.',
      type: 'qr_scan',
      points: 150,
      imageUrl: SVG_IMAGES.feedingStation,
      assignedTeamIds: ['team-alpha', 'team-beta'],
      payload: {
        targetCode: 'VULTURE-FEEDING-STATION',
        locationHint: 'Αναζητήστε την κάρτα σταθμού με την ταΐστρα γυπών στην αίθουσα ή στον χάρτη.'
      },
      payload_en: {
        targetCode: 'VULTURE-FEEDING-STATION',
        locationHint: 'Locate the station card showing the Vulture Restaurant inside the room or field map.'
      },
      explanation: 'Οι περιφραγμένες ταΐστρες παρέχουν ελεγμένα, ασφαλή κουφάρια χωρίς δηλητήρια και μόλυβδο, ενισχύοντας την επιβίωση των νεαρών πουλιών τον χειμώνα.',
      explanation_en: 'Enclosed supplementary feeding stations provide strictly inspected, non-toxic carcasses, bolstering juvenile winter survival.'
    },

    // 23
    {
      id: 'vulture-quest-23',
      title: 'Δακτυλίωση & Οπτικά Δακτυλίδια Πεδίου',
      title_en: 'Bird Ringing & Visual Field Observation Rings',
      description: 'Τι αναγράφεται στα μεγάλα χρωματιστά πλαστικά δακτυλίδια που τοποθετούνται στα πόδια των γυπών;',
      description_en: 'What is encoded on the large coloured plastic leg rings placed on wild and rehabilitated vultures?',
      type: 'multiple_choice',
      points: 100,
      imageUrl: SVG_IMAGES.gpsTransmitter,
      assignedTeamIds: ['team-delta', 'team-gamma'],
      payload: {
        options: [
          'Ένας μοναδικός σύντομος κωδικός από γράμματα και αριθμούς που διαβάζεται με τηλεσκόπιο από εκατοντάδες μέτρα',
          'Το όνομα και το τηλέφωνο του κτηνιάτρου',
          'Το βάρος και η ηλικία του πουλιού σε γραμμάρια',
          'Η ημερομηνία γέννησης και η ώρα απελευθέρωσης'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'A unique alphanumeric code that can be read through a spotting telescope from hundreds of metres away',
          'The veterinarian name and mobile phone number',
          'The exact hatching weight recorded in grams',
          'The timestamp of fledging and release hour'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Χάρη στα δακτυλίδια αυτά, παρατηρητές πουλιών σε όλη την Ευρώπη καταγράφουν τις μετακινήσεις μεμονωμένων πουλιών χωρίς να χρειάζεται να τα ξαναπιάσουν.',
      explanation_en: 'Thanks to these rings, birdwatchers across Europe record individual vulture movements across countries without recapture.'
    },

    // 24
    {
      id: 'vulture-quest-24',
      title: 'Γεωγραφία: Τα Τελευταία Καταφύγια των Γυπών στην Ελλάδα',
      title_en: 'Geography: The Last Refuges of Vultures in Greece',
      description: 'Αντιστοιχίστε κάθε περιοχή της Ελλάδας με τον σημαντικό πληθυσμό γυπών που φιλοξενεί.',
      description_en: 'Match each Greek geographic region with the significant vulture population it shelters.',
      type: 'text_match',
      points: 130,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-delta'],
      payload: {
        pairs: [
          { id: 'g1', left: 'Κρήτη (Φαράγγια & Λευκά Όρη)', right: 'Ο μεγαλύτερος πληθυσμός Όρνιων & οι τελευταίοι Γυπαετοί' },
          { id: 'g2', left: 'Εθνικό Πάρκο Δάσους Δαδιάς (Έβρος)', right: 'Η μοναδική αποικία Μαυρόγυπα στα Βαλκάνια' },
          { id: 'g3', left: 'Μετέωρα & Ήπειρος (Κλεισούρα)', right: 'Ιστορικές θέσεις φωλιάσματος Ασπροπάρη & Όρνιων' },
          { id: 'g4', left: 'Στενά & Φαράγγι Νέστου (Θράκη)', right: 'Αποικία Όρνιων στη Βόρεια Ελλάδα' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'g1', left: 'Crete (Gorges & White Mountains)', right: 'Largest insular Griffon population & last Balkan Bearded Vultures' },
          { id: 'g2', left: 'Dadia National Park (Evros)', right: 'The sole Black Vulture breeding colony in the Balkans' },
          { id: 'g3', left: 'Meteora & Epirus (Kleisoura)', right: 'Historic breeding cliffs for Egyptian and Griffon Vultures' },
          { id: 'g4', left: 'Nestos Gorge (Thrace)', right: 'Mainland Griffon Vulture colony in Northern Greece' }
        ]
      },
      explanation: 'Η Κρήτη είναι το παγκόσμιο προπύργιο του Όρνιου σε νησιωτικό περιβάλλον (πάνω από 1.000 άτομα) και το μοναδικό μέρος στα Βαλκάνια όπου επιβιώνει ο Γυπαετός!',
      explanation_en: 'Crete is an international stronghold for island Griffon Vultures (>1,000 birds) and the only refuge in the Balkans where Bearded Vultures survive!'
    },

    // 25
    {
      id: 'vulture-quest-25',
      title: 'Αποστολή Δράσης: Οι 4 Πυλώνες Προστασίας',
      title_en: 'Action Task: The 4 Pillars of Vulture Conservation',
      description: 'Επιβεβαιώστε την κατανόηση των τεσσάρων βασικών πυλώνων του Ευρωπαϊκού Σχεδίου Δράσης για τους Γύπες (Vulture Multi-Species Action Plan).',
      description_en: 'Confirm understanding of the four fundamental conservation pillars within the European Vulture Multi-Species Action Plan.',
      type: 'task',
      points: 120,
      assignedTeamIds: ['team-gamma', 'team-alpha'],
      payload: {
        instructions: 'Σημειώστε τα σημεία δράσης που πρέπει να εφαρμόζονται σε όλη την επικράτεια:',
        checklist: [
          'Άμεση ποινική δίωξη και μηδενική ανοχή στα δηλητηριασμένα δολώματα',
          'Ενεργές ταΐστρες και υποστήριξη της παραδοσιακής κτηνοτροφίας',
          'Μόνωση ηλεκτροφόρων καλωδίων & ασφαλής χωροθέτηση αιολικών πάρκων',
          'Εκπαίδευση και ενημέρωση μαθητών, αγροτών και κυνηγών'
        ],
        completionPrompt: 'Επιβεβαιώστε ότι η ομάδα ολοκλήρωσε τον έλεγχο των πυλώνων προστασίας.'
      },
      payload_en: {
        instructions: 'Check off the conservation action points that must be implemented across ranges:',
        checklist: [
          'Strict legal prosecution and zero tolerance for illegal poison baits',
          'Safe supplementary feeding stations & support for traditional pastoralists',
          'Insulation of medium-voltage lines & safe wind farm spatial planning',
          'Educational outreach for students, farmers, and hunting associations'
        ],
        completionPrompt: 'Confirm that your team has reviewed all conservation pillars.'
      },
      explanation: 'Η επιτυχής διατήρηση των γυπών απαιτεί συνδυασμό νομοθεσίας, τεχνολογίας και στενής συνεργασίας με την τοπική κοινωνία.',
      explanation_en: 'Successful vulture conservation requires integrating law enforcement, technology, and community stewardship.'
    },

    // 26
    {
      id: 'vulture-quest-26',
      title: 'Σωστό ή Λάθος: Το Διηπειρωτικό Ταξίδι Μετανάστευσης του Ασπροπάρη',
      title_en: 'True or False: Intercontinental Migration of Egyptian Vultures',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό σχετικά με τα μεταναστευτικά ταξίδια του Ασπροπάρη.',
      description_en: 'Evaluate the claim: "The Egyptian Vulture is the only European vulture that undertakes a transatlantic-like intercontinental migration each autumn, flying over 5,000 km to the African Sahel."',
      type: 'true_false',
      points: 110,
      imageUrl: SVG_IMAGES.egyptianVulture,
      assignedTeamIds: ['team-delta', 'team-beta'],
      payload: {
        correctValue: true
      },
      payload_en: {
        correctValue: true
      },
      explanation: 'Σωστό! Ενώ τα Όρνια, οι Γυπαετοί και οι Μαυρόγυπες μένουν όλο το χρόνο στην Ελλάδα (επιδημητικά), ο Ασπροπάρης φεύγει κάθε Σεπτέμβριο, διασχίζει τη Μεσόγειο και τη Σαχάρα και διαχειμάζει στο Σαχέλ της Αφρικής (Τσαντ, Νίγηρας, Σουδάν), επιστρέφοντας πίσω την άνοιξη!',
      explanation_en: 'True! While Griffon, Black, and Bearded Vultures are resident year-round, Egyptian Vultures are long-distance trans-Saharan migrants, flying over 5,000 km each September to the African Sahel and returning in spring!'
    },

    // 27
    {
      id: 'vulture-quest-27',
      title: 'QR Σταθμός: Παρακολούθηση Φωλιάς (Nest Watch)',
      title_en: 'QR Station: Cliff Nest Monitoring Watch',
      description: 'Σκανάρετε τον QR κωδικό του σταθμού παρακολούθησης φωλιάς για να καταγράψετε την επιτυχή εκκόλαψη του νεοσσού.',
      description_en: 'Scan the Nest Monitoring Station QR code to record successful chick hatching in the cliff cavity.',
      type: 'qr_scan',
      points: 150,
      imageUrl: SVG_IMAGES.cliffNest,
      assignedTeamIds: ['team-gamma', 'team-delta'],
      payload: {
        targetCode: 'VULTURE-NEST-WATCH',
        locationHint: 'Αναζητήστε την κάρτα σταθμού με τη φωλιά γύπα στον γκρεμό.'
      },
      payload_en: {
        targetCode: 'VULTURE-NEST-WATCH',
        locationHint: 'Find the station card representing cliff nest monitoring in the venue.'
      },
      explanation: 'Η παρακολούθηση με τηλεσκόπια και αυτόματες κάμερες φωλιάς επιτρέπει την προστασία του μοναδικού νεοσσού από ενόχληση και λαθροθηρία.',
      explanation_en: 'Monitoring with high-powered spotting scopes and nest cameras safeguards the single vulnerable chick from human disturbance.'
    },

    // 28
    {
      id: 'vulture-quest-28',
      title: 'Το Εντυπωσιακό Ύψος Πτήσης των Γυπών',
      title_en: 'Astounding Flight Altitude of Vultures',
      description: 'Σε τι ύψη μπορούν να πετάξουν οι γύπες εκμεταλλευόμενοι τα θερμά ανοδικά ρεύματα και την εξαιρετική τους αιμοσφαιρίνη;',
      description_en: 'To what remarkable altitudes can vultures ascend using thermal convection updrafts and specialized high-affinity haemoglobin?',
      type: 'multiple_choice',
      points: 110,
      imageUrl: SVG_IMAGES.griffonVulture,
      assignedTeamIds: ['team-alpha', 'team-delta'],
      payload: {
        options: [
          'Μπορούν να ξεπεράσουν τα 3.000 μέτρα, ενώ έχει καταγραφεί γύπας ακόμη και στα 11.000 μέτρα (ύψος πτήσης τζετ αεροπλάνου!)',
          'Πετούν το πολύ μέχρι τα 300 μέτρα γιατί ζαλίζονται',
          'Μέχρι τα 1.000 μέτρα επειδή παγώνουν τα φτερά τους',
          'Μόνο λίγα μέτρα πάνω από το έδαφος'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'They routinely exceed 3,000 metres, with the highest bird strike recorded at an astonishing 11,270 metres (commercial jet cruising altitude!)',
          'Never above 300 metres due to disorientation',
          'Strictly capped at 1,000 metres because feathers freeze',
          'Only a few metres skimming right above ground level'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Το 1973 ένα όρνιο Ruppell συγκρούστηκε με επιβατικό αεροπλάνο πάνω από την Ακτή Ελεφαντοστού στα 11.270 μέτρα! Οι γύπες διαθέτουν ειδική τροποποιημένη αιμοσφαιρίνη που δεσμεύει οξυγόνο ακόμη και στη σπάνια ατμόσφαιρα των 10.000 μέτρων.',
      explanation_en: 'In 1973 a Rüppell vulture collided with a commercial aircraft over West Africa at 11,270 metres! Vulture haemoglobin is genetically optimized to extract oxygen in sub-zero thin stratospheric air.'
    },

    // 29
    {
      id: 'vulture-quest-29',
      title: 'Ομαδική Φωτογραφία: Η Ομάδα Δράσης για τους Γύπες',
      title_en: 'Team Photo: The Vulture Conservation Taskforce',
      description: 'Συγκεντρώστε όλα τα μέλη της ομάδας σας! Βγάλτε μία δημιουργική φωτογραφία που να δείχνει το άνοιγμα των «φτερών» σας ή τα σύμβολα του είδους σας και ανεβάστε τη στον πίνακα!',
      description_en: 'Gather all team members! Capture a creative team photo showing your vulture "wingspan" or conservation emblems and upload it to the board!',
      type: 'photo_upload',
      points: 160,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        instructions: 'Σταθείτε μαζί όλη η ομάδα, αναπαραστήστε το άνοιγμα φτερών ενός γύπα (2.5 - 3 μέτρα!) και ανεβάστε τη φωτογραφία.'
      },
      payload_en: {
        instructions: 'Assemble your entire team, mimic a 3-metre vulture wingspan pose, and submit your team photo.'
      },
      explanation: 'Η ομαδικότητα και η συνεργασία είναι απαραίτητες για την επιτυχία κάθε περιβαλλοντικής ομάδας δράσης!',
      explanation_en: 'Camaraderie and teamwork are essential for any conservation field team protecting endangered wildlife!'
    },

    // 30
    {
      id: 'vulture-quest-30',
      title: 'Παζλ: Οικογένεια Γυπαετών στη Φωλιά του Βράχου',
      title_en: 'Puzzle: Bearded Vulture Family at Cliff Eyrie',
      description: 'Συναρμολογήστε το παζλ της φωλιάς του Γυπαετού σε δυσπρόσιτη σπηλιά απόκρημνου φαραγγιού.',
      description_en: 'Solve the puzzle of the Bearded Vulture nesting in an inaccessible cliff cavern in a remote gorge.',
      type: 'puzzle',
      points: 130,
      imageUrl: SVG_IMAGES.cliffNest,
      assignedTeamIds: ['team-alpha', 'team-gamma', 'team-delta'],
      payload: {
        gridPieces: 9,
        imageUrl: SVG_IMAGES.cliffNest
      },
      payload_en: {
        gridPieces: 9,
        imageUrl: SVG_IMAGES.cliffNest
      },
      explanation: 'Οι γυπαετοί χτίζουν τεράστιες φωλιές από κλαδιά και μαλλί προβάτων μέσα σε σπηλιές απόκρημνων βράχων, προστατευμένοι από τον άνεμο και το χιόνι.',
      explanation_en: 'Bearded vultures construct bulky nests lined with sheep wool in sheltered cavern alcoves, immune to howling alpine blizzards.'
    },

    // 31
    {
      id: 'vulture-quest-31',
      title: 'Τελικό Σύμφωνο Προστασίας: Δέσμευση της Ομάδας',
      title_en: 'Final Conservation Pledge: Team Commitment',
      description: 'Ολοκληρώστε το παιχνίδι επικυρώνοντας το επίσημο Σύμφωνο Προστασίας για τους Γύπες της Ελλάδας.',
      description_en: 'Complete the arena by verifying your official team conservation pledge for the Vultures of Greece.',
      type: 'task',
      points: 150,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        instructions: 'Επιβεβαιώστε τις 4 δεσμεύσεις της ομάδας σας για την προστασία της βιοποικιλότητας:',
        checklist: [
          'Διάδοση της αλήθειας: Οι γύπες είναι ωφέλιμοι καθαριστές και δεν σκοτώνουν ζωντανά ζώα',
          'Ενημέρωση των κατοίκων για το έγκλημα των δηλητηριασμένων δολωμάτων (φόλες)',
          'Υποστήριξη των τοπικών κτηνοτρόφων και των ορνιθολογικών ομάδων προστασίας',
          'Διατήρηση των άγριων φαραγγιών και των παρθένων δασών ελεύθερων από όχληση'
        ],
        completionPrompt: 'Υπογράψτε νοερά το Σύμφωνο Προστασίας και πατήστε Ολοκλήρωση!'
      },
      payload_en: {
        instructions: 'Confirm your team 4 pledges for biodiversity stewardship:',
        checklist: [
          'Spread the truth: Vultures are beneficial sanitary scavengers and do not attack live livestock',
          'Educate community members that poison baits are an illegal ecological crime',
          'Champion local pastoralists and wildlife conservation organizations',
          'Keep wild mountain canyons and old-growth forests undisturbed'
        ],
        completionPrompt: 'Ratify the Conservation Pledge and finalize the quest!'
      },
      explanation: 'Συγχαρητήρια! Η ομάδα σας ολοκλήρωσε τις 31 αποστολές για τους γύπες! Τώρα προχωρήστε στον πίνακα σύνθεσης για να καταγράψετε τα τελικά συμπεράσματά σας.',
      explanation_en: 'Congratulations! Your team has mastered the 31 vulture quests! Now proceed to the synthesis board to share your insights with the class.'
    },
    {
      id: 'vulture-quest-32',
      title: 'Επιστημονική Έρευνα Πεδίου: Σχέδιο Δράσης για τους 4 Γύπες',
      title_en: 'Field Scientific Research: Action Plan for Greece 4 Vultures',
      description: 'Ερευνήστε τις πηγές, απαντήστε στα καίρια ορνιθολογικά ερωτήματα και συντάξτε την έκθεση συμπερασμάτων της ομάδας σας.',
      description_en: 'Investigate the scientific sources, answer key ornithological questions, and formulate your team research findings.',
      type: 'research',
      points: 200,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        researchTopic: 'Μέτρα προστασίας, απειλές δηλητηρίασης και επιβίωση των 4 ειδών γυπών στον ελληνικό χώρο',
        instructions: 'Μελετήστε τις προτεινόμενες επιστημονικές πηγές και ιστοσελίδες περιβαλλοντικών οργανώσεων. Συζητήστε με την ομάδα σας, απαντήστε στα ερευνητικά ερωτήματα και καταγράψτε τα τελικά σας ευρήματα.',
        guidingQuestions: [
          'Ποιο είναι το κύριο αίτιο μείωσης του πληθυσμού του Ασπροπάρη στα Βαλκάνια και ποια μέτρα λαμβάνονται;',
          'Πώς συμβάλλουν οι ειδικά εκπαιδευμένοι σκύλοι ανίχνευσης δηλητηριασμένων δολωμάτων;',
          'Ποιος είναι ο ρόλος των ταϊστρών (τεχνητών σημείων σίτισης) για τη διατήρηση του Όρνεου και του Μαυρόγυπα;',
          'Τι προτείνει η ομάδα σας για τη συνύπαρξη της κτηνοτροφίας και των αρπακτικών πουλιών;'
        ],
        suggestedSources: [
          {
            title: 'Ελληνική Ορνιθολογική Εταιρεία - Πρόγραμμα Life για τους Γύπες',
            url: 'https://www.ornithologiki.gr',
            description: 'Επίσημα επιστημονικά δεδομένα, χάρτες κατανομής και δράσεις προστασίας.'
          },
          {
            title: 'WWF Ελλάς - Ομάδες Ανίχνευσης Δηλητηριασμένων Δολωμάτων',
            url: 'https://www.wwf.gr',
            description: 'Έκθεση για τη δράση των ειδικών σκύλων εντοπισμού παράνομων δηλητηρίων.'
          }
        ],
        minWords: 30,
        requiresSourceLinks: true,
        requiresEvidencePhoto: false
      },
      payload_en: {
        researchTopic: 'Conservation measures, poison threats, and survival of the 4 vulture species in Greece',
        instructions: 'Investigate scientific sources and environmental NGO initiatives. Discuss with your team, answer the guiding questions, and formulate your findings and proposed solutions.',
        guidingQuestions: [
          'What is the primary cause of Egyptian Vulture population decline in the Balkans and what interventions are implemented?',
          'How do specially trained canine detection teams combat illegal poison baits?',
          'What role do supplementary feeding stations (vulture restaurants) play for Griffon and Cinereous vultures?',
          'What collaborative practices does your team recommend for livestock farmers and vulture coexistence?'
        ],
        suggestedSources: [
          {
            title: 'Hellenic Ornithological Society - Vulture Conservation Projects',
            url: 'https://www.ornithologiki.gr',
            description: 'Scientific data, distribution mapping, and active conservation protocols.'
          },
          {
            title: 'WWF Greece - Anti-Poison Canine Units',
            url: 'https://www.wwf.gr',
            description: 'Field reports and documentation of detection dog units combating illegal poisoning.'
          }
        ],
        minWords: 30,
        requiresSourceLinks: true,
        requiresEvidencePhoto: false
      },
      explanation: 'Η επιστημονική τεκμηρίωση και η έρευνα πηγών είναι θεμέλιος λίθος για τη διατήρηση της άγριας πανίδας!',
      explanation_en: 'Rigorous scientific documentation and source investigation are fundamental to wildlife conservation!'
    }
  ],
  submissions: {},
  teamQuestionOrders: {},
  teamSequentialModes: {}
};


// Combined 46 questions state with all teams
export const ALL_COMBINED_GAME_STATE: GameState = {
  ...VULTURES_GAME_STATE,
  id: 'boundpad-mega-arena-46',
  title: 'BoundPad Mega Arena: 46 Αποστολές Γνώσεων & Γυπών',
  title_en: 'BoundPad Mega Arena: 46 Quests of Knowledge & Vultures',
  description: 'Πλήρης συλλογή 46 αποστολών που περιλαμβάνει όλες τις 32 αποστολές των 4 γυπών της Ελλάδας και τις 14 ερωτήσεις επιστήμης & γενικών γνώσεων.',
  description_en: 'Complete collection of 46 quests featuring all 32 Greek vulture conservation missions plus 14 science & knowledge questions.',
  timer: {
    totalSeconds: 2400, // 40 minutes
    remainingSeconds: 2400,
    isRunning: false,
    updatedAt: Date.now()
  },
  questions: [
    ...VULTURES_GAME_STATE.questions,
    ...EPIC_CHALLENGE_GAME_STATE.questions
  ]
};

// Default active game is VULTURES_GAME_STATE (the educational arena for the 4 vultures of Greece)
export const INITIAL_GAME_STATE: GameState = VULTURES_GAME_STATE;
