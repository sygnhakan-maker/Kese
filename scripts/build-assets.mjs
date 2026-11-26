// Package only the public client. The Worker bundle is built separately by Wrangler.
import {cp, mkdir, readdir, rm} from 'node:fs/promises';
const dest = new URL('../public-build/', import.meta.url);
const source = new URL('../', import.meta.url);
await rm(dest, {recursive:true, force:true});
await mkdir(dest);
const staticFile = /\.(css|html|js|webmanifest)$/;
for (const entry of await readdir(source, {withFileTypes:true})) {
  const folder = ['fonts','icons','vendor'].includes(entry.name);
  if (!(folder && entry.isDirectory()) && !(entry.isFile() && (staticFile.test(entry.name) || entry.name === 'rates.json'))) continue;
  await cp(new URL(entry.name, source), new URL(entry.name, dest), {recursive:folder});
}
