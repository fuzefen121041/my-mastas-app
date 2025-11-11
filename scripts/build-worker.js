/**
 * 构建脚本：准备 Cloudflare Workers 部署
 *
 * 这个脚本会：
 * 1. 读取 public/index.html
 * 2. 创建一个包含 HTML 内容的 TypeScript 模块
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');
const publicDir = resolve(rootDir, 'public');
const srcDir = resolve(rootDir, 'src');

console.log('🔨 Building for Cloudflare Workers...');

try {
  // 读取 index.html
  const indexHtmlPath = resolve(publicDir, 'index.html');
  const indexHtmlContent = readFileSync(indexHtmlPath, 'utf-8');

  // 转义反引号和 ${} 以便在模板字符串中使用
  const escapedContent = indexHtmlContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  // 创建 TypeScript 模块
  const moduleContent = `/**
 * 自动生成的文件 - 请勿手动编辑
 * 生成时间: ${new Date().toISOString()}
 */

const indexHtml = \`${escapedContent}\`;

export default indexHtml;
`;

  // 写入生成的模块
  const outputPath = resolve(srcDir, 'generated', 'index.html.ts');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, moduleContent, 'utf-8');

  console.log('✅ Generated:', outputPath);
  console.log('✅ Build complete!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
