// Authored paw-contact landmarks in the 512px ready cells. Tail, ears and
// transparent padding never determine the centre of support.
export const PAW_CONTACTS = Object.freeze({
  fire: [[174,459],[289,447],[332,479],[437,460]],
  water: [[104,473],[229,461],[287,495],[405,482]],
  plant: [[157,442],[242,437],[324,440],[412,442]],
});
export function contactCentre(key) {
  const paws=PAW_CONTACTS[key];
  return paws ? {
    x:paws.reduce((n,p)=>n+p[0],0)/paws.length,
    y:paws.reduce((n,p)=>n+p[1],0)/paws.length,
  } : null;
}
