// Re-applies the pnpm-hoisted-layout patches to the generated android project
// after every `expo prebuild`. Run: node ../../scripts/patch-android.cjs
// (from apps/mobile)
const fs = require('fs');
const path = require('path');
const mobile = process.cwd();
const settingsPath = path.join(mobile, 'android', 'settings.gradle');
let s = fs.readFileSync(settingsPath, 'utf8');

const searchPathsPatch = `
// pnpm hoisted layout installs all workspace dependencies in the monorepo's
// root node_modules — teach Expo autolinking to look there as well.
expoAutolinking.searchPaths = [new File(settingsDir, '../../node_modules').canonicalPath]
`;
if (!s.includes('expoAutolinking.searchPaths')) {
  s = s.replace(
    /extensions\.configure\(com\.facebook\.react\.ReactSettingsExtension\)/,
    `${searchPathsPatch}\nextensions.configure(com.facebook.react.ReactSettingsExtension)`,
  );
}

const rnCommandPatch = `    // pnpm hoisted layout: third-party RN packages live in the monorepo's
    // root node_modules, so append it to the resolution command.
    def rnConfigCommand = expoAutolinking.rnConfigCommand + [new File(settingsDir, '../../node_modules').canonicalPath]
    ex.autolinkLibrariesFromCommand(rnConfigCommand)`;
if (!s.includes('rnConfigCommand +')) {
  s = s.replace('    ex.autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand)', rnCommandPatch);
}

fs.writeFileSync(settingsPath, s);
console.log('android/settings.gradle patched for pnpm hoisted layout');

// Windows NDK workaround: some NDK/CMake combinations omit libc++_shared from
// module link lines (undefined operator new / __cxa_* at link time). Link it
// explicitly from the NDK sysroot.
const stlSnippet = (target) => [
  '',
  '# Windows toolchain workaround (scripts/patch-android.cjs): link libc++_shared',
  '# explicitly — some NDK/CMake combos omit it from the link line.',
  'get_filename_component(_BC_CXX_DIR "${CMAKE_CXX_COMPILER}" DIRECTORY)',
  'get_filename_component(_BC_PREBUILT "${_BC_CXX_DIR}" DIRECTORY)',
  'set(_BC_STL_LIB "${_BC_PREBUILT}/sysroot/usr/lib/${ANDROID_ABI}/libc++_shared.so")',
  'if(EXISTS "${_BC_STL_LIB}")',
  '  target_link_libraries(' + target + ' "${_BC_STL_LIB}")',
  'endif()',
  '',
].join('\n');
const cmakeTargets = [
  ['node_modules/expo-modules-core/android/CMakeLists.txt', 'expo-modules-core'],
  ['node_modules/react-native-screens/android/CMakeLists.txt', 'rnscreens'],
];
for (const [rel, target] of cmakeTargets) {
  const cmakePath = path.resolve(mobile, '..', '..', 'node_modules', 'expo-modules-core', '..', rel);
  const cmakePathFixed = path.normalize(path.join(mobile, '..', '..', rel));
  if (!fs.existsSync(cmakePathFixed)) continue;
  let cmake = fs.readFileSync(cmakePathFixed, 'utf8');
  if (!cmake.includes('scripts/patch-android.cjs')) {
    cmake += stlSnippet(target);
    fs.writeFileSync(cmakePathFixed, cmake);
    console.log('patched', rel);
  }
}
