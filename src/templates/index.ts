import * as fs from 'fs';
import * as path from 'path';
import { Template, TemplateIndex, isValidTemplate } from './schema';

export function loadTemplates(extensionPath?: string): TemplateIndex {
  const index: TemplateIndex = {
    byLanguage: new Map(),
    byId: new Map(),
  };

  // Resolve directory path: check candidate paths to support both src/out and unit testing outDir structures
  let bundledDir = path.join(__dirname, 'bundled');
  
  if (!fs.existsSync(bundledDir)) {
    bundledDir = path.join(__dirname, '..', 'bundled');
  }
  
  if (!fs.existsSync(bundledDir)) {
    bundledDir = path.join(__dirname, '..', '..', 'templates', 'bundled');
  }

  if (!fs.existsSync(bundledDir) && extensionPath) {
    bundledDir = path.join(extensionPath, 'out', 'templates', 'bundled');
  }

  if (fs.existsSync(bundledDir)) {
    try {
      const files = fs.readdirSync(bundledDir);
      for (const file of files) {
        if (file.endsWith('.templates.json')) {
          const filePath = path.join(bundledDir, file);
          const raw = fs.readFileSync(filePath, 'utf8');
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const validated: Template[] = [];
            for (const item of list) {
              if (isValidTemplate(item)) {
                validated.push(item);
                index.byId.set(item.id, item);
              } else {
                console.warn(`Invalid template in ${file}: ${JSON.stringify(item)}`);
              }
            }
            if (validated.length > 0) {
              const lang = validated[0].language;
              const existing = index.byLanguage.get(lang) || [];
              index.byLanguage.set(lang, [...existing, ...validated]);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to dynamically load templates from directory', err);
    }
  } else {
    console.warn(`Bundled templates directory not found at ${bundledDir}`);
  }

  return index;
}
