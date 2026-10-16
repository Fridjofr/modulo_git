"""Package runnable source/assets and selected real captures, preserving originals."""
from pathlib import Path
from hashlib import sha256
import zipfile
root=Path(__file__).resolve().parent.parent
output=root.parent/'zimons-academia.zip'
excluded={'node_modules','.npm-cache','test-results','playwright-report','.git','__pycache__'}
photos=None
files=[]
for p in root.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(root)
 if any(x in excluded for x in rel.parts) or p.suffix in {'.log','.pyc'}:continue
 if rel.parts[:2]==('docs','screenshots') and p.parent!=root/'docs/screenshots/v11':continue
 if rel.parts[:2]==('docs','previews') or rel.as_posix()=='INTEGRIDADE.sha256':continue
 files.append(p)
checksums=[]
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files):
  rel=p.relative_to(root).as_posix();data=p.read_bytes();checksums.append(f'{sha256(data).hexdigest()}  {rel}');z.writestr('zimons-academia/'+rel,data)
 z.writestr('zimons-academia/INTEGRIDADE.sha256','\n'.join(checksums)+'\n')
with zipfile.ZipFile(output) as z:
 bad=z.testzip()
 if bad:raise RuntimeError('Arquivo danificado: '+bad)
print(f'{output}: {output.stat().st_size/1048576:.1f} MiB, {len(files)} arquivos + manifesto SHA-256')
