const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const sharp = createRequire(require.resolve('next'))('sharp');

async function main() {
  const catalog = JSON.parse(await fs.readFile('scratch/booking-image-catalog.json', 'utf8'));
  const sources = JSON.parse(await fs.readFile('scratch/service-upload-image-sources.json', 'utf8'));
  const output = path.resolve('../output/service-image-uploads');
  const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const manifest = [];
  for (const service of catalog) {
    const source = sources[service.name];
    if (!source) throw new Error(`Missing image for ${service.name}`);
    const file = `${slug(service.category)}/${slug(service.name)}.webp`;
    const target = path.join(output, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await sharp(source).resize(512, 512, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 76, effort: 6 }).toFile(target);
    const metadata = await sharp(target).metadata();
    const { size } = await fs.stat(target);
    if (size >= 100 * 1024) throw new Error(`Image is not lightweight: ${service.name}`);
    manifest.push({ serviceId: service.id, service: service.name, category: service.category, file, width: metadata.width, height: metadata.height, bytes: size });
  }
  await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const escape = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Service image upload guide</title><style>body{font:14px/1.5 system-ui;margin:32px;color:#222;background:#fafafa}h1{font-size:26px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}article{padding:16px;background:white;border:1px solid #ddd}img{width:100%;height:150px;object-fit:contain}h2{font-size:16px;margin:10px 0 4px}p{margin:4px 0;color:#555}.file{overflow-wrap:anywhere;font-size:12px}</style><h1>Service images — upload guide</h1><p>Upload the file matching the service name. Consultation appears as General Consultation in booking.</p><main>${manifest.map(item => `<article><img src="${encodeURI(item.file)}" alt="${escape(item.service)}"><h2>${escape(item.service)}</h2><p>${escape(item.category)}</p><p class="file">${escape(item.file)}</p><p>${Math.round(item.bytes / 1024)} KB · ${item.width} × ${item.height}</p><a href="${encodeURI(item.file)}" download>Save image</a></article>`).join('')}</main></html>`;
  await fs.writeFile(path.join(output, 'index.html'), html);
  const readme = '# Service images for admin upload\n\nAll 28 current booking services have a corresponding image. WebP files are 512 px, under 100 KB each, and supported by the existing admin upload. No people or faces. Images were generated with the built-in imagegen tool; matching previously generated clinical images were reused.\n\nOpen index.html for a visual guide. Choose a service in admin, edit it, upload its matching file, and save. Consultation is named General Consultation on the booking page. No files have been uploaded automatically.\n\n| Service | Category | File | Size |\n|---|---|---|---|\n' + manifest.map(item => `| ${item.service} | ${item.category} | [${item.file}](${item.file}) | ${Math.round(item.bytes / 1024)} KB |`).join('\n') + '\n';
  await fs.writeFile(path.join(output, 'README.md'), readme);
  console.log(JSON.stringify({ images: manifest.length, totalKB: Math.round(manifest.reduce((sum, image) => sum + image.bytes, 0) / 1024), maxKB: Math.round(Math.max(...manifest.map(image => image.bytes)) / 1024), output }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
