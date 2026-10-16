import http from "node:http";
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".gif": "image/gif",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".md": "text/plain; charset=utf-8",
};
http
  .createServer(async (req, res) => {
    try {
      let requested = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (requested === "/") requested = "/index.html";
      const target = path.resolve(root, "." + requested);
      if (
        !target.startsWith(root + path.sep) ||
        requested
          .split("/")
          .some((p) => p.startsWith(".") || p === "node_modules")
      ) {
        res.writeHead(403);
        res.end("Acesso negado");
        return;
      }
      if (!(await stat(target)).isFile()) throw new Error("not file");
      const data = await readFile(target);
      res.writeHead(200, {
        "Content-Type":
          mime[path.extname(target)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(data);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Arquivo não encontrado");
    }
  })
  .on("error",error=>{
    console.error(error.code==='EADDRINUSE'
      ? `A porta ${port} já está em uso. Feche a outra janela do jogo e tente novamente.`
      : `Não foi possível iniciar ZIMONS: ${error.message}`);
    process.exitCode=1;
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`ZIMONS: http://localhost:${port} — mantenha esta janela aberta. Ctrl+C para encerrar.`);
    if(process.platform==='win32'&&process.env.ZIMONS_OPEN_BROWSER==='1'){
      const browser=spawn('cmd.exe',['/c','start','',`http://localhost:${port}`],{stdio:'ignore',windowsHide:true});
      browser.on('error',()=>console.log(`Abra http://localhost:${port} no navegador.`));
    }
  });
