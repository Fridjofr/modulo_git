// Combat cameras belong to their location. Exploration uses its own top-down art.
export function battleEnvironment(world, flags = {}) {
  if (world === "lab")
    return flags.labDamaged ? "battleLabDamaged" : "battleLab";
  if (world === "gym") return "battleGym";
  return "battleCourtyard";
}
