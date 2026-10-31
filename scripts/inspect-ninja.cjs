// Check whether the STL lib actually made it into the regenerated ninja file.
const fs = require('fs');
const p = 'C:/Users/mehul sharma/.zcode/workspace/default/borrowcircle/node_modules/react-native-screens/android/.cxx/RelWithDebInfo/5d696b4t/arm64-v8a/build.ninja';
if (!fs.existsSync(p)) { console.log('ninja missing'); process.exit(0); }
const s = fs.readFileSync(p, 'utf8');
console.log('libc++_shared mentions:', (s.match(/libc\+\+_shared/g) || []).length);
console.log('patch marker in cmake cache dir:', fs.existsSync('C:/Users/mehul sharma/.zcode/workspace/default/borrowcircle/node_modules/react-native-screens/android/.cxx/RelWithDebInfo/5d696b4t/arm64-v8a/CMakeFiles/rules.ninja'));
// find the rnscreens link rule flags
const lines = s.split('\n');
const idx = lines.findIndex((l) => l.includes('librnscreens.so') && l.startsWith('build '));
if (idx >= 0) {
  for (let j = idx + 1; j < Math.min(idx + 8, lines.length); j++) {
    if (lines[j].startsWith('  LINK_LIBRARIES')) console.log(lines[j].slice(0, 400));
  }
}
