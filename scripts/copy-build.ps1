$src = 'C:\Users\mehul sharma\.zcode\workspace\default\borrowcircle'
$dst = 'C:\bcb'
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst -ErrorAction SilentlyContinue }
robocopy $src $dst /E /XD node_modules .git .expo .gradle /XF *.log /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -le 7) { Write-Output "robocopy ok (code $LASTEXITCODE)" } else { Write-Output "robocopy FAILED (code $LASTEXITCODE)" }
Write-Output ('files at dest: ' + (Get-ChildItem $dst -Recurse -File -ErrorAction SilentlyContinue).Count)
