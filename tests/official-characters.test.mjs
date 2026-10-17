import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('fonte oficial preservada e 48 recortes mantêm escala e pés, sem esticar as proporções',async()=>{
 const dir=new URL('../assets/characters/official/',import.meta.url);
 const bytes=await readFile(new URL('source.png',dir)),meta=JSON.parse(await readFile(new URL('manifest.json',dir)));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'647544389a5c42e90c53212e0b55229206748b88129464e36c4717eb234c8c4a');
 for(const key of ['female','male','lira']) {
  const image=await readFile(new URL(key+'.png',dir));assert.equal(image.readUInt32BE(16),768);assert.equal(image.readUInt32BE(20),768);
  for(const frames of Object.values(meta.characters[key])) {
   assert.equal(frames.length,4);assert.deepEqual(frames.map(f=>f.frame),[0,1,2,3]);
   for(const f of frames){
    const [x,y,w,h]=f.visibleBounds;assert.equal(y+h,180);assert.ok(x>=0&&x+w<=192);
    assert.ok(Math.abs(w-f.sourceBounds[2]*meta.uniformScale)<=.5);
    assert.ok(Math.abs(h-f.sourceBounds[3]*meta.uniformScale)<=.5);
   }
  }
 }
});
