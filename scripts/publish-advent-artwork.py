#!/usr/bin/env python3
"""Publish private originals + display images, then emit catalog SQL. Dry run by default."""
import argparse, hashlib, json, pathlib, subprocess, tempfile
p=argparse.ArgumentParser()
p.add_argument('--bucket', required=True)
p.add_argument('--profile', default='agile-dev')
p.add_argument('--apply', action='store_true')
p.add_argument('--sql-output', required=True, type=pathlib.Path)
a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
items=json.loads((root/'art/advent-catalog.json').read_text())
def aws(*args):
    return subprocess.run(['aws','--profile',a.profile,'--region','us-east-1',*args],check=True,capture_output=True,text=True).stdout
if a.apply:
    block=json.loads(aws('s3api','get-public-access-block','--bucket',a.bucket))['PublicAccessBlockConfiguration']
    if not all(block.get(k) for k in ['BlockPublicAcls','IgnorePublicAcls','BlockPublicPolicy','RestrictPublicBuckets']):
        raise SystemExit('Use a private bucket with all four public-access blocks enabled.')
def sql(s): return "'"+s.replace("'","''")+"'"
statements=['BEGIN;']
with tempfile.TemporaryDirectory() as tmp:
    for item in items:
        source=root/item['file']
        digest=hashlib.sha256(source.read_bytes()).hexdigest()[:20]
        prefix=f"celebrations/advent/{item['id']}/{digest}"
        display=pathlib.Path(tmp)/(item['id']+'.jpg')
        # macOS built-in resizer; the full original remains separately preserved.
        subprocess.run(['sips','-Z','1600','-s','format','jpeg','-s','formatOptions','82',str(source),'--out',str(display)],check=True,capture_output=True)
        key=prefix+'/display.jpg'
        if a.apply:
            for file, target, mime in [(source,prefix+'/original.png','image/png'),(display,key,'image/jpeg')]:
                aws('s3','cp',str(file),f's3://{a.bucket}/{target}','--content-type',mime,'--cache-control','private,max-age=300','--sse','AES256','--only-show-errors')
        print(('Uploaded' if a.apply else 'Prepared')+': '+item['label'])
        statements.append('INSERT INTO advent_artwork(id,label,object_key,alt_text,enabled) VALUES('+','.join(sql(v) for v in [item['id'],item['label'],key,item['alt']])+',TRUE) ON CONFLICT(id) DO UPDATE SET label=EXCLUDED.label,object_key=EXCLUDED.object_key,alt_text=EXCLUDED.alt_text,enabled=TRUE;')
statements.append('COMMIT;')
a.sql_output.write_text('\n'.join(statements)+'\n')
print('Catalog SQL: '+str(a.sql_output)+('. Apply only after uploading these objects.' if not a.apply else ''))
