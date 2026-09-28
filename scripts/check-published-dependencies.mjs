import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
for(const [name,version] of Object.entries({...manifest.dependencies,...manifest.devDependencies})) {
  if (/^(file:|link:|workspace:)/.test(version)) {
    throw new Error(`${name} uses ${version}. Publish the shared package through its pipeline, then update package.json and package-lock.json to the registry version before deploying.`);
  }
}
