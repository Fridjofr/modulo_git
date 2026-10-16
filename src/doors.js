// Sliding leaves are sampled from the approved closed doorway itself. The frame
// stays in the wall. Animation is time-based and shared by manual and guided use.
export function doorway(map, exit) {
  const authored = map.doorSpecs?.find(d => d.id === exit.id);
  if (authored) return authored;
  if (map.indoor) {
    if (exit.y < 300) return { x: exit.x - 56, y: 86, w: 112, h: 72 };
    return map.art === "clinicApproved"
      ? { x: 568, y: 611, w: 144, h: 109 }
      : { x: 584, y: 622, w: 112, h: 66 };
  }
  if (exit.id === "plaza-entrance") return { x: 704, y: 20, w: 128, h: 130 };
  return null;
}
export function doorStep(current, target, dt) {
  return Math.max(
    0,
    Math.min(
      1,
      current +
        Math.sign(target - current) *
          Math.min(Math.abs(target - current), dt / 600),
    ),
  );
}
export function drawSlidingDoor(g, terrain, rect, progress, foreground = false) {
  if (progress <= 0 && !rect.source && !foreground) return;
  const { x, y, w, h } = rect,
    half = w / 2,
    shift = half * progress;
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  if (!foreground) {
    if (rect.openSource) {
      const o=rect.openSource;
      g.drawImage(terrain,o.x,o.y,o.w,o.h,x,y,w,h);
    } else {
      const depth = g.createLinearGradient(0,y,0,y+h);
      depth.addColorStop(0,"#193b50");depth.addColorStop(1,"#79929d");
      g.fillStyle=depth;g.fillRect(x,y,w,h);
    }
  }
  // Leaves retain their authored pixels, seals and gold emblem as they slide.
  const source=rect.source || rect;
  g.drawImage(terrain, source.x, source.y, source.w/2, source.h, x-shift, y, half, h);
  g.drawImage(terrain, source.x+source.w/2, source.y, source.w/2, source.h, x+half+shift,y,half,h);
  g.restore();
}

// The simulation owns progress; drawing and collision read the same value.
const progress = new Map();
export function resetDoorStates() { progress.clear(); }
export function doorProgress(world,id) { return progress.get(world+":"+id) || 0; }
export function setDoorProgress(world,id,value) { progress.set(world+":"+id,value); }
export function doorAuthorized(state,exit) {
  if(state.world!=="corridor") return true;
  const q=state.quest;
  return q==="complete" || ["room","analysis"].includes(q) || ["plaza","clinic"].includes(exit.to)
    || exit.to==="lab" && ["prepare","choose","recalibrate","practice","return","tour","challenge"].includes(q)
    || exit.to==="gym" && ["tour","challenge"].includes(q)
    || exit.to==="dorm" && !!state.story.flags.roomReady;
}
export function updateDoors(map,state,dt) {
  const actors=[state,state.story.lira].filter(a=>a&&a.visible!==false&&a.world===state.world);
  for(const exit of map.exits) {
    if(!doorway(map,exit))continue;
    const target=state.story.closingDoor===exit.id ? 0 :
      state.story.openDoor===exit.id || state.story.headingDoor===exit.id && actors.some(a=>a===state.story.lira && Math.hypot(a.x-exit.x,a.y-exit.y)<100) || doorAuthorized(state,exit) && actors.some(a=>Math.hypot(a.x-exit.x,a.y-exit.y)<100) ? 1 : 0;
    setDoorProgress(map.id,exit.id,doorStep(doorProgress(map.id,exit.id),target,dt*1000));
  }
}
export function doorBlocks(map,x,y,radius=9) {
  return (map.doorSpecs||[]).some(d=>doorProgress(map.id,d.id)<.96 &&
    x+radius>d.x && x-radius<d.x+d.w && y+radius>d.y && y-radius<d.y+d.h);
}
export function crossingPoint(map,exit) {
  const d=map.doorSpecs?.find(d=>d.id===exit.id);
  return d ? [exit.x,d.upper?d.y-12:d.y+d.h+12] : [exit.x,exit.y];
}
