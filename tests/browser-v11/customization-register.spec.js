import {test,expect} from '@playwright/test';
test('roupas não alteram a cabeça; cortes não alteram as pernas; cabeças seguem os marcos de cada passo',async({page})=>{
 await page.goto('/?debug=1');await expect(page.locator('#title')).toHaveClass(/active/);
 const problems=await page.evaluate(async()=>{
  const {Assets}=await import('/src/assets.js'),{DEFAULT_APPEARANCE:D}=await import('/src/model.js');
  const a=new Assets();await a.load();const errors=[];
  const pixels=c=>c.getContext('2d').getImageData(0,0,192,192).data;
  const same=(a,b,y0,y1)=>{for(let n=y0*192*4;n<y1*192*4;n++)if(a[n]!==b[n])return false;return true;};
  for(const gender of ['male','female'])for(const dir of ['down','up','left','right'])for(let phase=0;phase<4;phase++){
   const index=a.walkIndex(gender,dir,phase);
   for(let style=0;style<5;style++){
    const base=pixels(a.frame(gender,dir,index,{...D,gender,style,bag:0}).canvas);
    if(base.slice(0,192*4).some((v,n)=>n%4===3&&v>0)) errors.push(`${gender}/${dir}/${phase}/${style}: cabelo cortado na borda superior`);
    for(let outfit=1;outfit<5;outfit++){
     const selected=pixels(a.frame(gender,dir,index,{...D,gender,style,outfit,bag:0}).canvas);
     if(!same(base,selected,0,96))errors.push(`${gender}/${dir}/${phase}/${style}/${outfit}: roupa alterou cabeça`);
     if(!same(base,selected,139,192))errors.push(`${gender}/${dir}/${phase}/${style}/${outfit}: roupa alterou passos`);
    }
    if(style>0){const first=pixels(a.frame(gender,dir,index,{...D,gender,style:0,bag:0}).canvas);if(!same(base,first,139,192))errors.push(`${gender}/${dir}/${phase}: cabelo alterou pernas`);}
   }
   const r=a.looks.registration(gender,dir,index,a);
   if(!Object.values(r).every(Number.isInteger))errors.push('registro fracionário');
   if(Math.abs(r.headX)>35 || Math.abs(r.bodyX)>35 || Math.abs(r.headY)>4 || Math.abs(r.bodyY)>4)errors.push(`${gender}/${dir}/${phase}: registro excessivo ${JSON.stringify(r)}`);
  }
  return [...new Set(errors)];
 });expect(problems).toEqual([]);
});
