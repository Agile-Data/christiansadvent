import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
// The simple vector mark remains editable and legible at favicon sizes.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="104" fill="#173f35"/><path d="M136 408V104h248v304" fill="#cba453" stroke="#fff" stroke-width="20" stroke-linejoin="round"/><path d="M136 104l106 48v304l-106-48z" fill="#9e3045" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="m313 167 15 57 51 17-51 18-15 58-15-58-40-18 40-17z" fill="#fff"/><circle cx="211" cy="295" r="10" fill="#e7bd69"/></svg>`;
await writeFile('public/icon.svg',svg);
await writeFile('public/brand/door-star.svg',svg);
for (const [size,path] of [[192,'public/icon-192.png'],[512,'public/icon-512.png'],[180,'public/apple-icon.png'],[32,'public/favicon-32.png']]) {
 await sharp(Buffer.from(svg)).resize(size,size).png().toFile(path);
}
await sharp('art/branding/v1/advent-calendar-hero.png').resize({width:1200,withoutEnlargement:true}).webp({quality:88}).toFile('public/brand/advent-calendar.webp');
