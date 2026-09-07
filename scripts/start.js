const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'Zein Hub Backend');
const frontendDir = path.join(rootDir, 'Zein Hub Frontend');

const rootModules = path.join(rootDir, 'node_modules');
const backendModules = path.join(backendDir, 'node_modules');
const frontendModules = path.join(frontendDir, 'node_modules');

const args = process.argv.slice(2);
const forceInstall = args.some(arg => ['--install', '-i', '--force'].includes(arg));

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function installDependencies(cwd, label) {
  console.log(`\n==================================================`);
  console.log(`📦 [${label}] جاري تثبيت المكتبات والـ node_modules...`);
  console.log(`==================================================`);
  const result = spawnSync(`${npmCmd} install`, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
  if (result.status !== 0) {
    console.error(`\n❌ خطأ: فشل تثبيت مكتبات ${label}! (Error code: ${result.status})`);
    process.exit(result.status || 1);
  }
  console.log(`✅ [${label}] اكتمل التثبيت بنجاح!\n`);
}

// 1. Root dependencies (concurrently)
if (forceInstall || !fs.existsSync(rootModules)) {
  installDependencies(rootDir, 'Root (Zein Hub)');
}

// 2. Backend dependencies
if (forceInstall || !fs.existsSync(backendModules)) {
  installDependencies(backendDir, 'Backend (API)');
}

// 3. Frontend dependencies
if (forceInstall || !fs.existsSync(frontendModules)) {
  installDependencies(frontendDir, 'Frontend (Next.js)');
}

// 4. Run Development Servers
console.log('\n==================================================');
console.log('🚀 تشغيل خوادم Zein Hub (Backend & Frontend)...');
console.log('==================================================\n');

const devProcess = spawn(`${npmCmd} run dev`, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

devProcess.on('exit', (code) => {
  process.exit(code || 0);
});

process.on('SIGINT', () => {
  if (devProcess && !devProcess.killed) {
    devProcess.kill('SIGINT');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (devProcess && !devProcess.killed) {
    devProcess.kill('SIGTERM');
  }
  process.exit(0);
});
