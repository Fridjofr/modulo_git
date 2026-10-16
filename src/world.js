import { MAPS, FOREST_POINTS, mapStand } from './maps.js';
export { FOREST_POINTS };
export const WORLD_SIZE=Object.fromEntries(Object.entries(MAPS).map(([k,m])=>[k,m.size]));
export const FOREST_POLYGONS=[[[32,80],[1888,80],[1888,1120],[32,1120]]];
export function insidePolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
export const forestStand=(x,y,r=9)=>mapStand('forest',x,y,r);
export function questTarget(s){
 const goal={forest:['forest',1480,480,'Acompanhe Lira'],arrival:['plaza',768,174,'Academia'],entrance:['plaza',768,174,'Entrada principal'],medical:['corridor',210,171,'Enfermaria'],prepare:['corridor',496,171,'Laboratório'],choose:['lab',640,415,'Plataforma de Sincro'],sleep:['clinic',360,380,'Descansar'],recalibrate:['corridor',496,171,'Laboratório de Lira'],practice:['lab',640,415,'Sincro controlada'],return:['lab',640,415,'Encerrar a Sincro'],tour:['corridor',788,171,'Ginásio'],challenge:['gym',1105,500,'Nico'],analysis:['corridor',640,214,'Levar os resultados a Lira'],room:['corridor',1600,214,'Seu quarto'] }[s.quest];
 if(!goal)return null;
 if(goal[0]===s.world)return {x:goal[1],y:goal[2],label:goal[3]};
 const map=MAPS[s.world];let exit;
 if(s.world==='corridor')exit=map.exits.find(e=>e.to===goal[0]);
 if(!exit&&map.indoor)exit=map.exits.find(e=>e.to==='corridor');
 if(!exit&&s.world==='forest')exit=map.exits[0];
 if(!exit&&s.world==='road')exit=map.exits.find(e=>e.to==='plaza');
 if(!exit&&s.world==='plaza')exit=map.exits.find(e=>e.to==='corridor');
 if(!exit&&s.world==='gardens')exit=map.exits[0];
 return exit?{x:exit.x,y:exit.y,label:goal[3]}:null;
}
export function questDescription(s){if(s.quest==='complete')return 'Trecho concluído. Converse com os colegas na lateral para participar de exibições.';return null;}
