$log = Join-Path $env:TEMP 'bc-release4.log'
$t = Get-Content $log
$t | Select-String -Pattern '> Task .*FAILED' | Select-Object -First 4 | ForEach-Object { Write-Output $_.Line }
Write-Output '--- errors ---'
$t | Select-String -Pattern 'ld\.lld: error|CMake Error|ninja: error|error: ' | Select-Object -First 6 | ForEach-Object { Write-Output $_.Line.Substring(0, [Math]::Min(220, $_.Line.Length)) }
# confirm STL lib is now on the link line
$ninja = 'C:\bcb\node_modules\react-native-screens\android\.cxx\RelWithDebInfo\*\arm64-v8a\build.ninja'
Get-Item $ninja -ErrorAction SilentlyContinue | ForEach-Object {
  $s = Get-Content $_.FullName -Raw
  Write-Output ('ninja libc++_shared mentions: ' + ([regex]::Matches($s, 'libc\+\+_shared').Count))
}
