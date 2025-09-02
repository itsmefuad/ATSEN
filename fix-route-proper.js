import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, 'backend', 'src', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Fix the problematic route by changing it to a standard route
content = content.replace(
  '// TEMPORARY: Commenting out problematic route\n// app.use("/api/institutions/:idOrName/rooms", institutionRoomRoutes);',
  '// Fixed institution rooms route - using standard mounting\napp.use("/api/institution-rooms", institutionRoomRoutes);'
);

fs.writeFileSync(serverPath, content);
console.log('Fixed the institution rooms route in server.js');
