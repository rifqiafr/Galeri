$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath('Desktop')
$ShortcutFile = Join-Path $DesktopPath "PixelVault.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutFile)
$Shortcut.TargetPath = "msedge.exe"
$Shortcut.Arguments = "--app=http://localhost/Galeri/"
$Shortcut.Description = "PixelVault - Personal Visual Storage"
$Shortcut.Save()

Write-Output "Shortcut created at: $ShortcutFile"
