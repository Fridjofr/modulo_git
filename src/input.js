// Standard gamepads and keyboard share focusable DOM controls, including dialogs.
export function installGamepad(api) {
  let previous = [],
    nextNavigation = 0;
  const held = new Set();
  const visible = (node) =>
    !node.disabled &&
    !node.hidden &&
    node.getClientRects().length &&
    getComputedStyle(node).visibility !== "hidden";
  function controls() {
    const modal = document.querySelector("#modal:not([hidden])");
    const dialogue = document.querySelector("#dialogue:not([hidden])");
    const root = modal || dialogue || document.querySelector(".scene.active");
    return [...new Set([...(root?.querySelectorAll("button,input,select") || []),document.querySelector("#story-skip")].filter(Boolean))].filter(
      visible,
    );
  }
  function navigate(direction) {
    const list = controls();
    if (!list.length) return;
    const active = document.activeElement;
    if (
      active?.matches('input[type="range"]') &&
      ["left", "right"].includes(direction)
    ) {
      direction === "right" ? active.stepUp() : active.stepDown();
      active.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if (!list.includes(active)) {
      list[0].focus();
      return;
    }
    const verticalMenu = document.querySelector(
      "#modal:not([hidden]) .menu-buttons",
    );
    if (verticalMenu && ["up", "down"].includes(direction)) {
      list[
        (list.indexOf(active) + (direction === "down" ? 1 : -1) + list.length) %
          list.length
      ].focus();
      return;
    }
    const r = active.getBoundingClientRect(),
      x = r.x + r.width / 2,
      y = r.y + r.height / 2;
    const horizontal = ["left", "right"].includes(direction),
      positive = ["right", "down"].includes(direction);
    const choices = list
      .filter((n) => n !== active)
      .map((node) => {
        const b = node.getBoundingClientRect(),
          dx = b.x + b.width / 2 - x,
          dy = b.y + b.height / 2 - y;
        const forward = (horizontal ? dx : dy) * (positive ? 1 : -1),
          lateral = Math.abs(horizontal ? dy : dx);
        return { node, forward, score: forward + lateral * 2.2 };
      })
      .filter((n) => n.forward > 5)
      .sort((a, b) => a.score - b.score);
    (
      choices[0]?.node ||
      list[
        (list.indexOf(active) + (positive ? 1 : -1) + list.length) % list.length
      ]
    ).focus({ preventScroll: false });
  }
  document.addEventListener(
    "keydown",
    (event) => {
      const direction = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      }[event.key];
      if (
        !direction ||
        event.target.matches('input[type="text"],input:not([type]),textarea')
      )
        return;
      if (api.scene() === "world" && !api.locked()) return;
      event.preventDefault();
      navigate(direction);
    },
    { capture: true },
  );
  return (time) => {
    const pad = Array.from(navigator.getGamepads?.() || []).find(Boolean);
    const wants = [];
    if (pad && document.visibilityState !== "hidden") {
      const b = pad.buttons.map((n) => n.pressed);
      const ax = pad.axes[0] || 0,
        ay = pad.axes[1] || 0;
      const direction =
        b[12] || ay < -0.45
          ? "up"
          : b[13] || ay > 0.45
            ? "down"
            : b[14] || ax < -0.45
              ? "left"
              : b[15] || ax > 0.45
                ? "right"
                : null;
      if (api.scene() === "world" && !api.locked()) {
        if (direction) wants.push("arrow" + direction);
      } else if (direction && time > nextNavigation) {
        navigate(direction);
        nextNavigation = time + 210;
      }
      if (b[0] && !previous[0]) {
        const sync = document.querySelector("#sync-pulse");
        if (sync && visible(sync)) sync.click();
        else api.confirm();
      }
      if (b[1] && !previous[1]) api.cancel();
      if (b[3] && !previous[3]) api.transform();
      if (b[9] && !previous[9]) api.menu();
      previous = b;
    } else previous = [];
    for (const key of held)
      if (!wants.includes(key)) {
        api.keys.delete(key);
        held.delete(key);
      }
    for (const key of wants) {
      api.keys.add(key);
      held.add(key);
    }
  };
}
