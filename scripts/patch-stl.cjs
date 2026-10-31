// Re-applies the STL link patch: strips any previous block, then adds a
// libc++_shared link resolved from CMAKE_ANDROID_NDK (cache variable).
const fs = require('fs');
const path = require('path');
const root = 'C:/Users/mehul sharma/.zcode/workspace/default/borrowcircle';
const copy = 'C:/bcb';
const targets = [
  [path.join(root, 'node_modules', 'expo-modules-core', 'android', 'CMakeLists.txt'), 'expo-modules-core'],
  [path.join(root, 'node_modules', 'react-native-screens', 'android', 'CMakeLists.txt'), 'rnscreens'],
  [path.join(copy, 'node_modules', 'expo-modules-core', 'android', 'CMakeLists.txt'), 'expo-modules-core'],
  [path.join(copy, 'node_modules', 'react-native-screens', 'android', 'CMakeLists.txt'), 'rnscreens'],
];
const snippet = (target) => [
  '',
  '# Windows toolchain workaround (scripts/patch-stl.cjs): link libc++_shared',
  '# explicitly — this NDK/CMake combo omits it from the link line.',
  'file(GLOB _BC_PREBUILT "${CMAKE_ANDROID_NDK}/toolchains/llvm/prebuilt/*")',
  'foreach(_BC_DIR ${_BC_PREBUILT})',
  '  if(IS_DIRECTORY "${_BC_DIR}/sysroot/usr/lib/${ANDROID_ABI}")',
  '    set(_BC_STL_LIB "${_BC_DIR}/sysroot/usr/lib/${ANDROID_ABI}/libc++_shared.so")',
  '  endif()',
  'endforeach()',
  'if(_BC_STL_LIB)',
  '  target_link_libraries(' + target + ' "${_BC_STL_LIB}")',
  '  unset(_BC_STL_LIB)',
  'endif()',
  '',
].join('\n');
for (const [p, target] of targets) {
  if (!fs.existsSync(p)) { console.log('missing:', p); continue; }
  let s = fs.readFileSync(p, 'utf8');
  const marker = '# Windows toolchain workaround (scripts/';
  const i = s.indexOf(marker);
  if (i >= 0) s = s.slice(0, i).trimEnd() + '\n';
  s += snippet(target);
  fs.writeFileSync(p, s);
  console.log('patched:', p);
}
