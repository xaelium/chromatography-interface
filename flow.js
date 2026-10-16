// Original vector schematic based on the user-supplied Cytiva reference.
// Component arrangement is illustrative, not model-specific instrument plumbing.
export function renderFlow({flow, b, uv, collect, mode, running=true}) {
 const idle='#aab3b8',green=running?'#299149':idle,loop=running?'#80b5c2':idle;
 const tube=(d,color=green,id='')=>`<g ${id?`data-route="${id}"`:''}><path d="${d}" class="tube-border"/><path d="${d}" class="tube" stroke="${color}"/><path d="${d}" class="tube-shine"/></g>`;
 const text=(x,y,t,cls='component-label',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${t}</text>`;
 const port=(x,y)=>`<circle cx="${x}" cy="${y}" r="4" class="port"/>`;
 const valve=(x,y,r=29)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#valve-metal)" stroke="#a4adb1"/><circle cx="${x-7}" cy="${y-8}" r="${r*.57}" fill="#fff" opacity=".16"/>`;
 const module=(x,y,w,h,title)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="url(#module-metal)" stroke="#a4adb1"/>${text(x+w/2,y+h/2+4,title,'module-label')}`;
 const wells=Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return `<circle cx="${1160+29*Math.cos(a)}" cy="${220+29*Math.sin(a)}" r="3" fill="#fff" stroke="#8a969c"/>`;}).join('');
 return `<svg viewBox="0 0 1240 390" role="img" aria-labelledby="flow-title flow-description" class="instrument-svg">
 <title id="flow-title">Chromatography system tubing and valve connections</title><desc id="flow-description">Buffer inlets A1 and B1 feed separate pumps, join at a pressure monitor, then pass through a mixer, six-port injection valve and sample loop, column valve and column, UV and conductivity cells, and an outlet valve. ${running?'Green tubing indicates the selected flow route; gray tubing is inactive.':'Pumps are stopped; all tubing is shown inactive.'} Outlet is set to ${collect?'fraction collection':'waste'}. Column bypass and manual sample loading lines are inactive. Injection valve is shown in the inject position.</desc>
 <defs><radialGradient id="valve-metal" cx="32%" cy="24%" r="80%"><stop stop-color="#fff"/><stop offset=".48" stop-color="#e9ecee"/><stop offset=".82" stop-color="#c4cace"/><stop offset="1" stop-color="#9da7ad"/></radialGradient><linearGradient id="module-metal" x2="0" y2="1"><stop stop-color="#c9cfd2"/><stop offset=".2" stop-color="#f8f9fa"/><stop offset=".7" stop-color="#e1e5e7"/><stop offset="1" stop-color="#b2bcc1"/></linearGradient><linearGradient id="column-glass"><stop stop-color="#b4c1c8"/><stop offset=".3" stop-color="#f5fbff" stop-opacity=".8"/><stop offset=".6" stop-color="#fff"/><stop offset="1" stop-color="#93a8b4"/></linearGradient><pattern id="resin-bed" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#ece2bd"/><circle cx="2" cy="2" r="1" fill="#c3b37a"/></pattern><marker id="direction" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9Z" fill="#238442"/></marker></defs>
 <rect x="0" y="0" width="1240" height="64" rx="4" fill="#f1f4f5"/>
 ${running?`${text(20,23,'System flow','readout-label','start')}${text(20,47,flow.toFixed(3)+' mL/min','readout-value','start')}
 ${text(210,23,'Buffer B','readout-label','start')}${text(210,47,b.toFixed(1)+' %','readout-value','start')}
 ${text(390,23,'UV 280 nm · modeled','readout-label','start')}${text(390,47,uv.toFixed(1)+' mAU','readout-value','start')}
 ${text(650,23,'Injection valve','readout-label','start')}${text(650,47,'Inject / sample loop inline','readout-small','start')}
 ${text(970,23,'Outlet','readout-label','start')}${text(970,47,collect?'Fraction collector':'Waste','readout-small','start')}`:text(20,38,'Pumps stopped · instrument readouts appear during playback','readout-small','start')}
 <!-- Inlet selectors and both physical pump lines -->
 ${tube('M20 134H64',b<100?green:idle,'inlet-a1')}${tube('M20 164H45Q55 164 64 148',idle)}
 ${tube('M20 279H64',b>0?green:idle,'inlet-b1')}${tube('M20 309H45Q55 309 64 293',idle)}
 ${tube('M114 140H143Q157 140 165 140H215Q240 140 258 172L280 220',b<100?green:idle,'pump-a')}
 ${tube('M114 285H143Q157 285 165 285H215Q240 285 258 254L280 220',b>0?green:idle,'pump-b')}
 ${valve(89,140,25)}${valve(89,285,25)}${port(64,140)}${port(114,140)}${port(64,285)}${port(114,285)}
 ${text(89,144,'A1','module-label')}${text(89,289,'B1','module-label')}
 ${text(20,123,'A1','tube-label','start')}${text(20,182,'A2','tube-label','start')}${text(20,268,'B1','tube-label','start')}${text(20,327,'B2','tube-label','start')}
 ${module(165,111,50,58,'A')}${module(165,256,50,58,'B')}
 ${running?text(190,99,((100-b)*flow/100).toFixed(2)+' mL/min','tube-label'):''}${running?text(190,244,(b*flow/100).toFixed(2)+' mL/min','tube-label'):''}
 <!-- Pressure monitor, mixer, injection valve -->
 ${tube('M280 220H433')}${valve(280,220,18)}${text(280,224,'P','module-label')}${module(329,202,43,36,'M')}
 ${text(280,271,'Pressure','tube-label')}${text(350,190,'Mixer','tube-label')}
 <!-- Manual sample loading pair (inactive in inject position) -->
 ${tube('M456 179V130Q456 113 437 113H420',idle,'manual-load')}
 ${tube('M504 179V130Q504 113 523 113H541V137',idle,'sample-waste')}
 <g transform="translate(400 103) rotate(-25)"><rect x="0" y="0" width="22" height="11" rx="2" fill="#d6e5ec" stroke="#91a5b0"/><path d="M22 5H34M-7 5H0M-7 0V10" stroke="#91a5b0" stroke-width="2"/></g>
 ${text(415,93,'Manual load','tube-label')}${text(546,157,'W1','tube-label')}
 ${valve(480,220,47)}
 ${tube('M456 261V290C456 323 504 323 504 290V261',loop,'sample-loop')}
 ${tube('M433 220Q446 220 456 261',green,'injection-in')}
 ${tube('M504 261Q514 220 527 220',green,'injection-out')}
 <path d="M456 179Q480 160 504 179" fill="none" stroke="${idle}" stroke-width="4"/>
 ${[[433,220],[456,179],[504,179],[527,220],[504,261],[456,261]].map(([x,y])=>port(x,y)).join('')}
 ${text(480,216,'INJ','module-label')}${text(480,234,'Inject','tube-label')}${text(480,337,'Sample loop','tube-label')}
 <!-- Column valve: bypass return is physically connected but not selected -->
 ${tube('M527 220H588')}${tube('M640 220H679Q698 220 698 187V158H737',green,'column-in')}
 ${tube('M737 282H781Q796 282 796 263V220H833',green,'column-out')}
 ${tube('M614 246V309Q614 323 629 323H781Q796 323 796 307V282',idle,'column-bypass')}
 ${valve(614,220,26)}${tube('M588 220H640')}${port(588,220)}${port(640,220)}${port(614,246)}
 ${text(614,181,'Column valve','tube-label')}${text(614,281,'Bypass','tube-label')}
 <rect x="724" y="151" width="26" height="139" rx="7" fill="url(#column-glass)" stroke="#899ca7"/><rect x="730" y="177" width="14" height="88" fill="url(#resin-bed)" stroke="#b9b38e"/><rect x="721" y="151" width="32" height="9" rx="3" fill="#a34c71"/><rect x="721" y="281" width="32" height="9" rx="3" fill="#a34c71"/>
 ${text(737,130,mode==='sec'?'SEC':mode==='iex'?'IEX':'IMAC','tube-label')}
 <!-- Detector train and outlet branches -->
 ${tube('M833 220H1041')}${module(833,202,52,36,'UV')}${module(917,202,52,36,'Cond')}
 ${tube('M1069 220H1124',collect?green:idle,'collector')}${tube('M1041 247V300H1080',collect?idle:green,'outlet-waste')}
 ${valve(1041,220,28)}${tube(collect?'M1013 220H1069':'M1013 220Q1041 220 1041 247',green,'outlet-selected')}${port(1013,220)}${port(1069,220)}${port(1041,247)}
 ${text(1041,224,collect?'F':'W','module-label')}
 <path d="M1078 286H1100L1097 318H1081Z" fill="#e5ebee" stroke="#a5b1b9"/>${text(1089,337,'Waste','tube-label')}
 ${valve(1160,220,40)}<circle cx="1160" cy="220" r="20" fill="#dce3e7" stroke="#a4adb1"/>${wells}<path d="M1124 220H1141" stroke="${collect?green:idle}" stroke-width="5"/><circle cx="1160" cy="220" r="6" fill="#b6c1c8"/>
 <path d="M390 220H409M557 220H574M891 220H908" stroke="${green}" stroke-width="2" marker-end="${running?'url(#direction)':'none'}"/>
 ${text(79,371,'Buffer inlets')}${text(190,371,'System pumps')}${text(350,371,'Mixing')}${text(480,371,'Injection')}${text(737,371,'Column')}${text(900,371,'Detection')}${text(1041,371,'Outlet')}${text(1160,371,'Fraction collector')}
 </svg>`;
}
