// Buduje instalator Windows przez Inno Setup (omija winCodeSign electron-buildera).
// Kroki: electron-vite build -> electron-builder --dir (win-unpacked) -> ISCC.
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

function run(cmd) {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

function findISCC() {
  const candidates = [
    'C:\\Program Files\\Inno Setup 7\\ISCC.exe',
    'C:\\Program Files (x86)\\Inno Setup 7\\ISCC.exe',
    'C:\\Program Files\\Inno Setup 6\\ISCC.exe',
    'C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe'
  ]
  for (const c of candidates) if (existsSync(c)) return c
  throw new Error('Nie znaleziono ISCC.exe (Inno Setup). Zainstaluj Inno Setup 6/7.')
}

run('npm run build')
run('npx electron-builder --win --dir')

const iscc = findISCC()
const iss = join('installer', 'setup.iss')
run(`"${iscc}" "${iss}"`)

console.log('\n✅ Instalator gotowy w katalogu dist\\')
