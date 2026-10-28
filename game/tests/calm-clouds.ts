import assert from 'node:assert/strict';
import {calmClouds} from '../lib/calm-clouds.ts';
const now=1793212345678,a=calmClouds(now),b=calmClouds(now+1000);
assert.equal(a.length,29);
for(let i=0;i<a.length;i++){
 assert(Math.abs(b[i].x-a[i].x-4)<.001);
 assert.equal(a[i].width,b[i].width);assert.equal(a[i].y,b[i].y);
 assert(a[i].width<180);
}
assert(Math.max(...a.map(c=>c.y))>500,'cloud groups cover the lower sky too');
assert(a.some((c,i)=>a.some((d,j)=>i!==j&&c.x<d.x+d.width&&d.x<c.x+c.width&&c.y<d.y+d.height&&d.y<c.y+c.height)),'some pieces form natural overlapping groups');
console.log('PASS: full-height sky groups, small fixed sizes, slow steady drift');
