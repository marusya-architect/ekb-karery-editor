/* Directional horizon test on DSM samples. Does not alter vector geometries. */
(function(root){
'use strict';
function classify(sample,lon,lat,sun,{step=60,distance=2000}={}){
 const z=sample(lon,lat);if(z===null||!Number.isFinite(z))return 2;
 const cos=Math.cos(lat*Math.PI/180),east=-Math.sin(sun.azimuth),north=-Math.cos(sun.azimuth),rise=Math.tan(sun.altitude);let missing=false;
 for(let d=step;d<=distance;d+=step){const h=sample(lon+east*d/(111320*cos),lat+north*d/111320);if(h===null||!Number.isFinite(h)){missing=true;continue;}if(h>z+rise*d+.5)return 1;}
 return missing?2:0;
}
const api={classify};if(typeof module==='object')module.exports=api;else root.EKBTerrainShadow=api;
})(typeof window==='undefined'?globalThis:window);
