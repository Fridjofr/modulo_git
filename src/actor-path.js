import {mapStand} from './maps.js';
// Feet occupy circles. Visual depth may overlap hair; bodies never share space.
export const ACTOR_SEPARATION=32;
export function actorCanStand(world,x,y,actor,others,radius=11){
 return mapStand(world,x,y,radius)&&others.every(o=>o===actor||o.visible===false||o.world!==world||Math.hypot(x-o.x,y-o.y)>=ACTOR_SEPARATION);
}
export function sceneRoute(world,start,goals,others=[]){
 const step=16,result=[];let from=[start.x,start.y];
 for(const goal of goals){
  const begin=[Math.round(from[0]/step),Math.round(from[1]/step)],queue=[begin],prev=new Map([[begin.join(),null]]);let found;
  const clear=(x,y)=>mapStand(world,x,y,11)&&others.every(o=>o.visible===false||o.world!==world||Math.hypot(x-o.x,y-o.y)>=ACTOR_SEPARATION+3);
  if(!clear(...goal))throw Error(`Destino de cena ocupado: ${world} ${goal}`);
  for(let i=0;i<queue.length;i++){
   const q=queue[i];if(Math.hypot(q[0]*step-goal[0],q[1]*step-goal[1])<step){found=q;break;}
   for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const n=[q[0]+dx,q[1]+dy],key=n.join();if(!prev.has(key)&&clear(n[0]*step,n[1]*step)){prev.set(key,q);queue.push(n);}}
  }
  if(!found)throw Error(`Sem passagem para a cena: ${world} ${goal}`);
  const path=[];for(let q=found;q;q=prev.get(q.join()))path.unshift(q.map(v=>v*step));
  const simplified=path.filter((p,i)=>i>0&&(i===path.length-1||(path[i-1][0]===p[0])!==(path[i+1][0]===p[0])));
  // Orthogonal connectors preserve feet collision even between off-grid endpoints.
  const last=simplified.at(-1)||from;
  if(last[0]!==goal[0])simplified.push([goal[0],last[1]]);if(last[1]!==goal[1])simplified.push([...goal]);
  result.push(...simplified);from=goal;
 }
 return result.length?result:[...goals];
}
