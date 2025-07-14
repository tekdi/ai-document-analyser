import fs from 'fs';
import path from 'path';

const documentTypesDir = path.resolve('server/documentTypes');
const modelsPath = path.resolve('server/models.json');

let documentTypesCache = null;
let modelsCache = null;

export function getDocumentTypes() {
  if (!documentTypesCache) {
    documentTypesCache = {};
    const files = fs.readdirSync(documentTypesDir);
    console.log('Document type files:', files); // Debug
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const docType = JSON.parse(fs.readFileSync(path.join(documentTypesDir, file), 'utf-8'));
        console.log('Loaded docType:', docType.displayName); // Debug
        if (docType.type) {
          documentTypesCache[docType.type] = docType;
        }
      }
    });
  }
  return documentTypesCache;
}

export function getDocumentType(type) {
  return getDocumentTypes()[type];
}

export function getModels() {
  if (!modelsCache) {
    modelsCache = JSON.parse(fs.readFileSync(modelsPath, 'utf-8'));
  }
  return modelsCache;
}