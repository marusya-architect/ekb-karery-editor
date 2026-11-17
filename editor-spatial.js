/* Geometry helpers work on copies; territory features are never rewritten. */
(function(root){
'use strict';
function points(g){if(g.type==='GeometryCollection')return g.geometries.flatMap(points);let a=g.coordinates;while(a.length&&Array.isArray(a[0][0]))a=a.flat();return g.type==='Point'?[a]:a;}
function bbox(f,margin=0){const p=points(f.geometry),xs=p.map(p=>p[0]),ys=p.map(p=>p[1]),w=Math.min(...xs),e=Math.max(...xs),s=Math.min(...ys),n=Math.max(...ys),dy=margin/111320,dx=dy/Math.cos((s+n)/2*Math.PI/180);return [w-dx,s-dy,e+dx,n+dy];}
function intersects(a,b){return a[0]<=b[2]&&a[2]>=b[0]&&a[1]<=b[3]&&a[3]>=b[1];}
function shadow(f,sun,lat){if(!(sun.altitude>Math.PI/180)||!(f.properties.height>0))return null;
 const length=f.properties.height/Math.tan(sun.altitude),dx=length*Math.sin(sun.azimuth)/(111320*Math.cos(lat*Math.PI/180)),dy=length*Math.cos(sun.azimuth)/111320;
 const shift=p=>[p[0]+dx,p[1]+dy],polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[],result=[];
 const orient=(ring,outer=true)=>{const area=ring.slice(1).reduce((s,p,i)=>s+ring[i][0]*p[1]-p[0]*ring[i][1],0);return (area>0)===outer?ring:ring.slice().reverse();};
 for(const poly of polys){result.push(poly.map((r,i)=>orient(r.map(shift),i===0)));for(const ring of poly)for(let i=1;i<ring.length;i++)result.push([orient([ring[i-1],ring[i],shift(ring[i]),shift(ring[i-1]),ring[i-1]])]);}
 return {type:'Feature',properties:{...f.properties,shadow_length_m:length},geometry:{type:'MultiPolygon',coordinates:result}};
}
// ZIP STORE, UTF-8 names and standard CRC32. No network or external export service.
function zip(files){const enc=new TextEncoder(),parts=[],central=[];let offset=0;const table=Array.from({length:256},(_,i)=>{for(let j=0;j<8;j++)i=i&1?0xedb88320^(i>>>1):i>>>1;return i>>>0});
 const crc=b=>{let c=0xffffffff;for(const v of b)c=table[(c^v)&255]^(c>>>8);return (c^0xffffffff)>>>0};
 for(const [name,text]of Object.entries(files)){const n=enc.encode(name),data=enc.encode(text),sum=crc(data),h=new Uint8Array(30+n.length),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,sum,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,n.length,true);h.set(n,30);parts.push(h,data);
 const c=new Uint8Array(46+n.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,sum,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);c.set(n,46);central.push(c);offset+=h.length+data.length;}
 const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,central.length,true);ev.setUint16(10,central.length,true);ev.setUint32(12,central.reduce((s,c)=>s+c.length,0),true);ev.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});
}
const api={bbox,intersects,shadow,zip};if(typeof module==='object')module.exports=api;else root.EKBSpatial=api;
})(typeof window==='undefined'?globalThis:window);
