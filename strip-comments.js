const fs = require('fs');
const path = require('path');

function stripCSSComments(src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+$/gm, '')
        .trim() + '\n';
}

function stripJSComments(src) {
    let result = '';
    let i = 0;
    const len = src.length;

    while (i < len) {
        const ch = src[i];
        const next = src[i + 1];

        if ((ch === '"' || ch === "'" || ch === '`') ) {
            const quote = ch;
            result += src[i++];
            while (i < len) {
                if (src[i] === '\\') { result += src[i++]; result += src[i++]; continue; }
                if (src[i] === quote) break;
                result += src[i++];
            }
            if (i < len) result += src[i++];
        }
        else if (ch === '/' && next === '*') {
            i += 2;
            while (i + 1 < len && !(src[i] === '*' && src[i + 1] === '/')) i++;
            i += 2;
        }
        else if (ch === '/' && next === '/') {
            i += 2;
            while (i < len && src[i] !== '\n') i++;
        }
        else {
            result += src[i++];
        }
    }

    return result
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+$/gm, '')
        .trim() + '\n';
}

const srcDir = path.join(__dirname, 'src');
const serverFile = path.join(__dirname, 'server.js');

function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const stripped = stripCSSComments(content);
            fs.writeFileSync(fullPath, stripped, 'utf8');
            console.log('CSS stripped:', entry.name);
        } else if (entry.name.match(/\.(ts|tsx|js)$/) && !entry.name.endsWith('.d.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const stripped = stripJSComments(content);
            fs.writeFileSync(fullPath, stripped, 'utf8');
            console.log('JS/TS stripped:', entry.name);
        }
    }
}

processDir(srcDir);

const serverContent = fs.readFileSync(serverFile, 'utf8');
fs.writeFileSync(serverFile, stripJSComments(serverContent), 'utf8');
console.log('JS/TS stripped: server.js');

console.log('\nDone! All comments removed.');
