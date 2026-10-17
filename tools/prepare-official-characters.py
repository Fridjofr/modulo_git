"""Separate the approved RGB contact sheet, without inventing poses or anatomy.
Requires Pillow, numpy and scipy only to regenerate assets, never to run the game.
Curved dark seams separate neighbouring hair outlines; exterior black is keyed out.
"""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes, label
root=Path(__file__).resolve().parent.parent
folder=root/'assets/characters/official'
source=Image.open(folder/'source.png').convert('RGB')
pixels=np.array(source)
rows=[(40,282),(283,510),(512,732),(734,970)]
centres=[[84,218,350,482,620,733,844,954,1054,1167,1279,1390],
 [82,215,347,480,618,731,842,954,1053,1165,1278,1390],
 [85,220,351,482,623,735,846,955,1056,1167,1278,1390],
 [65,196,328,460,598,710,821,931,1049,1161,1272,1384]]
meta={'source':'assets/characters/official/source.png','sha256':hashlib.sha256((folder/'source.png').read_bytes()).hexdigest(),
      'canvas':192,'baseline':180,'anchor':96,'referenceHeight':174,'uniformScale':.78,
      'directions':['down','up','left','right'],'characters':{},'notes':[
       'Source is RGB on black. Exterior black is removed; enclosed dark details remain.',
       'Adjacent hair silhouettes touch in the supplied flattened sheet; dark curved seams partition them. No hidden pixels are reconstructed.',
       'All frames use one uniform scale, a shared sole baseline and independently measured foot centre. No old protagonist pixels are used.']}
sheets={k:Image.new('RGBA',(768,768)) for k in ['lira','female','male']}
for row,(y0,y1) in enumerate(rows):
 rgb=pixels[y0:y1];h,w=rgb.shape[:2];light=rgb.max(2).astype(float)
 boundaries=[np.zeros(h,dtype=int)]
 for left,right in zip(centres[row],centres[row][1:]):
  mid=(left+right)//2;lo=max(left+30,mid-33);hi=min(right-30,mid+33)
  xs=np.arange(lo,hi+1);cost=(light[:,lo:hi+1]>12)*1000+light[:,lo:hi+1]+abs(xs-mid)*.025
  dp=cost[0].copy();back=[]
  for yy in range(1,h):
   options=np.stack([np.r_[np.inf,dp[:-1]],dp,np.r_[dp[1:],np.inf]])
   choice=options.argmin(0);dp=cost[yy]+options.min(0);back.append(choice)
  path=np.zeros(h,dtype=int);pos=int(dp.argmin());path[-1]=pos+lo
  for yy in range(h-2,-1,-1):pos+=int(back[yy][pos])-1;path[yy]=pos+lo
  boundaries.append(path)
 boundaries.append(np.full(h,w,dtype=int))
 for col,cx in enumerate(centres[row]):
  mask=(np.arange(w)[None,:]>=boundaries[col][:,None])&(np.arange(w)[None,:]<boundaries[col+1][:,None])&(light>12)
  labels,n=label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0;mask=labels==sizes.argmax()
  mask=binary_fill_holes(mask) # restore enclosed black outlines/eyes, not exterior black
  yy,xx=np.nonzero(mask);x0,x1=xx.min(),xx.max()+1;top,bottom=yy.min(),yy.max()+1
  foot=mask & (np.arange(h)[:,None]>=bottom-13)
  fx=float(np.median(np.nonzero(foot)[1]));fy=int(bottom)
  rgba=np.dstack((rgb,np.where(mask,255,0).astype('uint8')))
  cell=Image.fromarray(rgba[:,x0:x1]).crop((0,top,x1-x0,bottom))
  size=(round(cell.width*.78),round(cell.height*.78));cell=cell.resize(size,Image.Resampling.NEAREST)
  dx=round(96-(fx-x0)*.78);dy=180-size[1]
  key=['lira','female','male'][col//4];index=col%4
  # Frame zero is the authored planted resting pose, not a lifted walking foot.
  order = [2,0,1,3] if key=='male' and row in [0,1] or key=='female' and row==0 else [1,0,2,3] if key=='female' and row==1 else [0,1,2,3]
  index=order.index(index)
  sheets[key].alpha_composite(cell,(index*192+dx,row*192+dy))
  meta['characters'].setdefault(key,{}).setdefault(meta['directions'][row],[]).append({
   'frame':index,'sourceFrame':col%4,'sourceBounds':[int(x0),int(y0+top),int(x1-x0),int(bottom-top)],
   'sourceFeet':[round(fx,3),int(y0+fy)],'placement':[dx,dy],
   'visibleBounds':[dx,dy,*size]})
for key in meta['characters']:
 for direction in meta['directions']:meta['characters'][key][direction].sort(key=lambda f:f['frame'])
for key,sheet in sheets.items():sheet.save(folder/(key+'.png'))
(folder/'manifest.json').write_text(json.dumps(meta,indent=2)+'\n')
print('Prepared 48 official frames; original SHA256:',meta['sha256'])
