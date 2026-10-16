// Deliberately reduced teaching model; parameters are not resin calibration data.
export const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
export function sequenceProperties(input) {
 const seq=input.replace(/^>.*$/gm,'').replace(/\s/g,'').toUpperCase();
 if(!seq || /[^ACDEFGHIKLMNPQRSTVWY]/.test(seq)) throw Error('Enter a protein sequence using the 20 standard amino acids (FASTA accepted).');
 const masses={A:71.0788,R:156.1875,N:114.1038,D:115.0886,C:103.1388,E:129.1155,Q:128.1307,G:57.0519,H:137.1411,I:113.1594,L:113.1594,K:128.1741,M:131.1926,F:147.1766,P:97.1167,S:87.0782,T:101.1051,W:186.2132,Y:163.1760,V:99.1326};
 const count=c=>[...seq].filter(x=>x===c).length;
 const charge=pH=>1/(1+10**(pH-9.69))-1/(1+10**(2.34-pH)) + count('K')/(1+10**(pH-10.5))+count('R')/(1+10**(pH-12.4))+count('H')/(1+10**(pH-6))-count('D')/(1+10**(3.86-pH))-count('E')/(1+10**(4.25-pH))-count('C')/(1+10**(8.33-pH))-count('Y')/(1+10**(10.07-pH));
 let lo=0,hi=14; for(let i=0;i<70;i++){const mid=(lo+hi)/2; if(charge(mid)>0)lo=mid;else hi=mid;}
 return {mw:([...seq].reduce((s,c)=>s+masses[c],18.0153))/1000, pi:(lo+hi)/2, extinction:count('W')*5500+count('Y')*1490, length:seq.length};
}
export function defaultProtocol(mode='iex',flow=1) {
 if(mode==='sec') return [{phase:'Load',volume:2,flow,b0:0,b1:0,collect:true},{phase:'Hold',volume:22,flow,b0:0,b1:0,collect:true}];
 return [{phase:'Load',volume:2,flow,b0:0,b1:0,collect:false},{phase:'Wash',volume:4,flow,b0:0,b1:0,collect:false},{phase:'Gradient',volume:15,flow,b0:0,b1:100,collect:true},{phase:'Hold',volume:3,flow,b0:100,b1:100,collect:true}];
}
export function compileProtocol(steps, mode) {
 if(!Array.isArray(steps)||!steps.length||steps.length>20) throw Error('Use between 1 and 20 protocol steps.');
 if(steps.filter(s=>s.phase==='Load').length!==1) throw Error('Include exactly one Load step for the sample injection.');
 let volume=0,time=0;
 const timeline=steps.map((step,index)=>{
  if(!['Equilibrate','Load','Wash','Gradient','Hold'].includes(step.phase)) throw Error('Choose a valid step type.');
  for(const key of ['volume','flow','b0','b1']) if(!Number.isFinite(step[key])) throw Error('All protocol values must be numbers.');
  if(step.volume<.1||step.volume>100||step.flow<.1||step.flow>5||step.b0<0||step.b0>100||step.b1<0||step.b1>100) throw Error('Step limits: 0.1–100 mL, 0.1–5 mL/min, and 0–100% B.');
  if(mode==='sec'&&(step.b0!==0||step.b1!==0)) throw Error('SEC uses a single buffer: set all B percentages to 0.');
  const s={...step,index,startV:volume,startT:time};volume+=step.volume;time+=step.volume/step.flow;return {...s,endV:volume,endT:time};
 });
 if(volume>240) throw Error('The protocol may contain at most 240 mL.');
 return {timeline,volume,duration:time};
}
export function atTime(result,time) {
 const t=clamp(time,0,result.duration);
 const step=result.timeline.find(s=>t<s.endT)||result.timeline.at(-1);
 const f=clamp((t-step.startT)/(step.endT-step.startT),0,1);
 return {step,time:t,v:step.startV+f*step.volume,b:step.b0+(step.b1-step.b0)*f,flow:step.flow};
}
export function timeAtVolume(timeline,v) {
 const s=timeline.find(s=>v<s.endV)||timeline.at(-1);
 return s.startT+clamp((v-s.startV)/s.volume,0,1)*(s.endT-s.startT);
}
export function apparentConcentration(uv,mw,epsilon,path) {
 if(epsilon<=0||path<=0) return null;
 return {mgMl:uv*mw/(epsilon*path),microMolar:uv*1000/(epsilon*path)};
}
export function simulate(p) {
 const legacy=!p.protocol;
 const steps=p.protocol||defaultProtocol(p.mode,p.flow).map(s=>({...s,collect:true}));
 const {timeline,volume,duration}=compileProtocol(steps,p.mode);
 const fractionVolume=p.fractionVolume??1,load=p.load??1,epsilon=p.epsilon??50000,path=p.path??.2;
 if(!Number.isFinite(fractionVolume)||fractionVolume<.25||fractionVolume>10) throw Error('Fraction volume must be 0.25–10 mL.');
 const injection=timeline.find(s=>s.phase==='Load');
 const proteins=[{name:'Target',mw:p.mw,pi:p.pi,tag:p.tag,amount:load,color:'#157b78'}, {name:'Contaminant A',mw:22,pi:5.2,tag:false,amount:load*.65,color:'#bf8334'},{name:'Contaminant B',mw:115,pi:8.7,tag:false,amount:load*.5,color:'#9976b1'}];
 function elutionVolume(threshold) {
  for(const s of timeline.filter(s=>s.endV>injection.startV)) {
   const start=Math.max(s.startV,injection.startV),f=(start-s.startV)/s.volume;
   const first=s.b0+(s.b1-s.b0)*f;
   if(first*p.strength/100>=threshold) return start===injection.startV?start+2.5:start;
   if(s.b1>s.b0&&s.b1*p.strength/100>=threshold) return s.startV+(threshold/p.strength*100-s.b0)/(s.b1-s.b0)*s.volume;
  }
  return Infinity;
 }
 const peaks=proteins.map(protein=>{
  let center,width,bound=true;
  if(p.mode==='sec') {center=injection.startV+8+clamp((Math.log10(300)-Math.log10(protein.mw))/Math.log10(300/5),0,1)*12;width=.65;}
  else if(p.mode==='iex') {const attraction=p.exchanger==='anion'?p.ph-protein.pi:protein.pi-p.ph;bound=attraction>.2;center=bound?elutionVolume(60+Math.max(0,attraction)*90):injection.startV+2.5;width=bound?.65:.5;}
  else {bound=protein.tag;center=bound?elutionVolume(150):injection.startV+2.5;width=bound?.55:.65;}
  const step=timeline.find(s=>center>=s.startV&&center<s.endV)||injection;
  width*=1+Math.max(0,step.flow-1)*.22;
  return {...protein,center,width,bound};
 });
 const density=(peak,v)=>v<injection.startV?0:peak.amount/(peak.width*Math.sqrt(2*Math.PI))*Math.exp(-.5*((v-peak.center)/peak.width)**2);
 const sampleAt=time=>{const q=atTime({timeline,duration},time),concentrations=peaks.map(x=>density(x,q.v));return {...q,concentrations,uv:concentrations[0]*epsilon*path/p.mw+(concentrations[1]+concentrations[2])*800*path};};
 // Explicit step boundaries preserve sharp changes in flow or collection.
 const peakTimes=peaks.filter(p=>Number.isFinite(p.center)).flatMap(p=>Array.from({length:121},(_,i)=>p.center+(i-60)*p.width/10).filter(v=>v>=0&&v<=volume).map(v=>timeAtVolume(timeline,v)));
 const times=[...new Set([...Array.from({length:1001},(_,i)=>i*duration/1000),...peakTimes,...timeline.flatMap(s=>[s.startT,s.endT])])].sort((a,b)=>a-b);
 const points=times.map(sampleAt);
 const fractions=[];
 for(let i=0;i<timeline.length;) {
  if(!timeline[i].collect){i++;continue;}
  const start=timeline[i].startV;let end=timeline[i].endV;i++;
  while(i<timeline.length&&timeline[i].collect){end=timeline[i].endV;i++;}
  for(let a=start;a<end-1e-8;a+=fractionVolume){const b=Math.min(a+fractionVolume,end),vol=b-a;
   const amounts=peaks.map(peak=>{let sum=0;const n=Math.max(40,Math.ceil(vol*80));for(let j=0;j<n;j++)sum+=density(peak,a+(j+.5)*vol/n)*vol/n;return sum;});
   const total=amounts.reduce((x,y)=>x+y,0);
   fractions.push({index:fractions.length+1,startV:a,endV:b,volume:vol,startT:timeAtVolume(timeline,a),endT:timeAtVolume(timeline,b),amounts,total,purity:total?amounts[0]/total:0});
  }
 }
 return {points,peaks,fractions,duration,volume,timeline,sampleAt,load,epsilon,path,legacy};
}
