"""Package current runnable source and all assets; omit historical media/build caches."""
from pathlib import Path
from hashlib import sha256
import json, subprocess, zipfile
root=Path(__file__).resolve().parent.parent
version=json.loads((root/'package.json').read_text())['version']
output=root.parent/f'ZIMONS-v{version}-Windows.zip'
excluded={'node_modules','.npm-cache','test-results','playwright-report','.git','__pycache__'}
media_prefixes=('docs/review/','docs/screenshots/','docs/previews/')
if (root/'.git').exists():
 result=subprocess.run(['git','ls-files','-z'],cwd=root,capture_output=True,check=True)
 candidates=[root/name for name in result.stdout.decode().split('\0') if name]
else:
 candidates=[p for p in root.rglob('*') if p.is_file()]
files=[]
for p in candidates:
 rel=p.relative_to(root)
 if not p.is_file() or any(x in excluded for x in rel.parts):continue
 if rel.as_posix().startswith(media_prefixes) or rel.as_posix()=='INTEGRIDADE.sha256':continue
 if p.suffix in {'.log','.pyc','.zip'}:continue
 files.append(p)
required=['index.html','INICIAR.bat','LEIA-ME-WINDOWS.txt','PROBLEMAS_CONHECIDOS.md','tools/server.mjs','assets/world/approved-final/ZIMONS_Enfermaria_Final_Aprovada.png']
selected={p.relative_to(root).as_posix() for p in files}
missing=set(required)-selected
if missing:raise RuntimeError('Arquivos não incluídos no índice Git: '+str(sorted(missing)))
checksums=[]
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(files):
  rel=p.relative_to(root).as_posix();data=p.read_bytes();checksums.append(f'{sha256(data).hexdigest()}  {rel}');z.writestr('ZIMONS/'+rel,data)
 z.writestr('ZIMONS/INTEGRIDADE.sha256','\n'.join(checksums)+'\n')
with zipfile.ZipFile(output) as z:
 bad=z.testzip()
 if bad:raise RuntimeError('Arquivo danificado: '+bad)
print(f'{output}: {output.stat().st_size/1048576:.1f} MiB, {len(files)} arquivos + manifesto SHA-256')
