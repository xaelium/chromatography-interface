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
export function simulate(p) {
 const proteins=[{name:'Target',mw:p.mw,pi:p.pi,tag:p.tag,amount:1,color:'#157b78'}, {name:'Contaminant A',mw:22,pi:5.2,tag:false,amount:.65,color:'#bf8334'},{name:'Contaminant B',mw:115,pi:8.7,tag:false,amount:.5,color:'#9976b1'}];
 const volume=24, duration=volume/p.flow;
 const peaks=proteins.map(protein=>{
  let center,width,bound=true;
  if(p.mode==='sec') {center=8+clamp((Math.log10(300)-Math.log10(protein.mw))/Math.log10(300/5),0,1)*12;width=.65;}
  else if(p.mode==='iex') {const attraction=p.exchanger==='anion'?p.ph-protein.pi:protein.pi-p.ph; const salt=60+Math.max(0,attraction)*90; bound=attraction>.2;center=bound?(salt<=p.strength?6+salt/p.strength*15:Infinity):2.5;width=bound?.65:.5;}
  else {bound=protein.tag;center=bound?6+150/p.strength*15:2.5;width=bound?.55:.65;}
  width*=1+Math.max(0,p.flow-1)*.22;
  return {...protein,center,width,bound};
 });
 const density=(peak,v)=>peak.amount/(peak.width*Math.sqrt(2*Math.PI))*Math.exp(-.5*((v-peak.center)/peak.width)**2);
 const points=Array.from({length:481},(_,i)=>{const v=i*volume/480;return {v,time:v/p.flow,uv:peaks.reduce((s,x)=>s+density(x,v)*500,0),b:p.mode==='sec'?0:clamp((v-6)/15,0,1)*100};});
 const fractions=Array.from({length:24},(_,i)=>{const amounts=peaks.map(peak=>{let sum=0;for(let j=0;j<40;j++)sum+=density(peak,i+(j+.5)/40)/40;return sum;}); const total=amounts.reduce((a,b)=>a+b,0);return {index:i+1,amounts,total,purity:total?amounts[0]/total:0};});
 return {points,peaks,fractions,duration,volume};
}
