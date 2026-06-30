import * as fs from 'fs';
import * as path from 'path';
import { Template, TemplateIndex, isValidTemplate } from './schema';

export function loadTemplates(extensionPath: string): TemplateIndex {
  const index: TemplateIndex = {
    byLanguage: new Map(),
    byId: new Map(),
  };

  const cppPath = path.join(extensionPath, 'src', 'templates', 'bundled', 'cpp.templates.json');
  if (fs.existsSync(cppPath)) {
    try {
      const raw = fs.readFileSync(cppPath, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const validated: Template[] = [];
        for (const item of list) {
          if (isValidTemplate(item)) {
            validated.push(item);
            index.byId.set(item.id, item);
          } else {
            console.warn(`Invalid template found: ${JSON.stringify(item)}`);
          }
        }
        index.byLanguage.set('cpp', validated);
      }
    } catch (err) {
      console.error('Failed to load C++ templates', err);
    }
  } else {
    console.warn(`C++ templates file not found at ${cppPath}`);
  }

  return index;
}
