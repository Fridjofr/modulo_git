const paths={
 book:'M3 5q4-2 9 0 5-2 9 0v15q-4-2-9 0-5-2-9 0zM12 5v15',
 bag:'M5 8h14v13H5zM8 8V5a4 4 0 0 1 8 0v3M8 13h8v5H8z',
 quest:'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4',
 map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16',
 link:'m12 2 10 10-10 10L2 12zM8 12l4-4 4 4-4 4z',
 gear:'m9 3 6 0 1 4 4 1 1 6-4 2-1 4-6 1-2-4-4-1-1-6 4-2zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 affinities:'M12 3v18M3 12h18M5 5l14 14M5 19 19 5',
 tonic:'M9 2h6v5l4 5v8q-7 4-14 0v-8l4-5zM9 5h6M5 13q7 3 14 0M9 16h6M12 13v6',
 zlink:'M8 1h8l1 6 3 2v6l-3 2-1 6H8l-1-6-3-2V9l3-2zM8 8h8v8H8zM12 10v4M10 12h4',
 lock:'M5 10h14v11H5zM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
 fire:'M13 2q-1 6 5 9 4 7-3 10-10 3-11-5-1-4 3-8 0 6 3 6 2-6 3-12z',
 claw:'m3 18 8-15-4 17M9 20 16 4l-2 17M16 20l6-13-2 14',
 eye:'M2 12q10-14 20 0-10 14-20 0zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
};
export function uiIcon(name){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.link}"/></svg>`;}
