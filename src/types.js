const paths = {
  Fogo: "M12 2c1 5 5 6 5 11a5 5 0 1 1-10 0c0-3 2-5 3-7 0 3 1 4 2 4 1-3 1-5 0-8Z",
  Água: "M12 2c-2 5-7 9-7 13a7 7 0 0 0 14 0c0-4-5-8-7-13Z",
  Planta: "M20 3C8 2 2 7 5 15c5 7 15 2 15-12ZM5 20 17 7",
  Físico: "m12 3 9 9-9 9-9-9 9-9Zm0 5v8m-4-4h8",
  Terra: "m3 19 6-13 4 8 3-5 5 10H3Z",
  Elétrico: "m14 2-9 12h6l-1 8 9-13h-6l1-7Z",
  Luz: "m12 2 2 7 8 3-8 2-2 8-3-8-7-2 7-3 3-7Z",
  Sombra: "M18 3A9 9 0 1 0 21 17 8 8 0 0 1 18 3Z",
  Cristal: "m6 3-4 7 10 12 10-12-4-7H6Zm-4 7h20M6 3l6 19 6-19",
};
export function typeBadge(type) {
  return `<span class="type-pill" data-type="${type}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[type] || paths.Físico}"/></svg>${type}</span>`;
}
