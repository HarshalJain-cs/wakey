/**
 * Simple build script for the browser extension.
 * Compiles TypeScript to JavaScript and copies files to dist folder.
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const srcDir = path.join(__dirname, 'src');
const popupDir = path.join(__dirname, 'popup');
const iconsDir = path.join(__dirname, 'icons');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
fs.copyFileSync(
    path.join(__dirname, 'manifest.json'),
    path.join(distDir, 'manifest.json')
);
console.log('✓ Copied manifest.json');

// Copy popup files
const popupDistDir = path.join(distDir, 'popup');
if (!fs.existsSync(popupDistDir)) {
    fs.mkdirSync(popupDistDir, { recursive: true });
}

if (fs.existsSync(path.join(popupDir, 'popup.html'))) {
    fs.copyFileSync(
        path.join(popupDir, 'popup.html'),
        path.join(popupDistDir, 'popup.html')
    );
    console.log('✓ Copied popup.html');
}

if (fs.existsSync(path.join(popupDir, 'popup.js'))) {
    fs.copyFileSync(
        path.join(popupDir, 'popup.js'),
        path.join(popupDistDir, 'popup.js')
    );
    console.log('✓ Copied popup.js');
}

// Copy icons
const iconsDistDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDistDir)) {
    fs.mkdirSync(iconsDistDir, { recursive: true });
}

if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir);
    iconFiles.forEach(file => {
        fs.copyFileSync(
            path.join(iconsDir, file),
            path.join(iconsDistDir, file)
        );
    });
    console.log(`✓ Copied ${iconFiles.length} icon files`);
}

// Build TypeScript
const isWatch = process.argv.includes('--watch');

const buildOptions = {
    entryPoints: [path.join(srcDir, 'background.ts')],
    outfile: path.join(distDir, 'background.js'),
    bundle: true,
    format: 'esm',
    target: 'chrome90',
    minify: !isWatch,
    sourcemap: isWatch,
};

if (isWatch) {
    esbuild.context(buildOptions).then(ctx => {
        ctx.watch();
        console.log('👀 Watching for changes...');
    });
} else {
    esbuild.build(buildOptions).then(() => {
        console.log('✓ Built background.js');
        console.log('\n✅ Extension build complete! Load from: dist/');
    });
}
