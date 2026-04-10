import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, 'backend', 'src', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Replace the problematic route line
content = content.replace(
  'app.use("/api/institutions/:idOrName/rooms", institutionRoomRoutes);',
  '// TEMPORARY: Commenting out problematic route\n// app.use("/api/institutions/:idOrName/rooms", institutionRoomRoutes);'
);

fs.writeFileSync(serverPath, content);
console.log('Fixed the problematic route in server.js');
