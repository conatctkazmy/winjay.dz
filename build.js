const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CleanCSS = require('clean-css');
const terser = require('terser');

const root = process.cwd();
const distDir = path.join(root, 'dist');
const distAssetsDir = path.join(distDir, 'assets');

const ensureDir = (dir) => {
    fs.mkdirSync(dir, { recursive: true });
};

const writeFile = (filePath, contents) => {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, contents);
};

const hash10 = (input) => crypto.createHash('sha256').update(input).digest('hex').slice(0, 10);

const readText = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readBuffer = (rel) => fs.readFileSync(path.join(root, rel));

const build = async () => {
    ensureDir(distAssetsDir);

    const srcCss = readText('style.css');
    const srcJs = readText('script.js');
    const srcHtml = readText('index.html');

    const minCss = new CleanCSS({ level: 2 }).minify(srcCss);
    if (minCss.errors && minCss.errors.length) {
        throw new Error(minCss.errors.join('\n'));
    }
    const cssOut = String(minCss.styles || '');

    const minJs = await terser.minify(srcJs, {
        compress: {
            passes: 2,
            toplevel: false
        },
        mangle: {
            toplevel: false
        },
        format: {
            comments: false
        }
    });
    if (minJs.error) throw minJs.error;
    const jsOut = String(minJs.code || '');

    const cssHash = hash10(cssOut);
    const jsHash = hash10(jsOut);

    const cssFile = `assets/app.${cssHash}.min.css`;
    const jsFile = `assets/app.${jsHash}.min.js`;

    writeFile(path.join(distDir, cssFile), cssOut);
    writeFile(path.join(distDir, jsFile), jsOut);

    const manifest = {
        css: cssFile,
        js: jsFile,
        builtAt: new Date().toISOString()
    };
    writeFile(path.join(distAssetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    let htmlOut = srcHtml;
    htmlOut = htmlOut.replace(/href=\"style\.css\?v=[^\"]*\"/g, `href="${cssFile}"`);
    htmlOut = htmlOut.replace(/href=\"style\.css\"/g, `href="${cssFile}"`);
    htmlOut = htmlOut.replace(/href=\"script\.js\?v=[^\"]*\"/g, `href="${jsFile}"`);
    htmlOut = htmlOut.replace(/src=\"script\.js\?v=[^\"]*\"/g, `src="${jsFile}"`);
    htmlOut = htmlOut.replace(/src=\"script\.js\"/g, `src="${jsFile}"`);

    writeFile(path.join(distDir, 'index.html'), htmlOut);

    const copy = (rel) => writeFile(path.join(distDir, rel), readBuffer(rel));
    const maybeCopy = (rel) => {
        try {
            copy(rel);
        } catch (e) {
            null;
        }
    };

    maybeCopy('endinar.com.png');
    maybeCopy('algeria_communes.json');
};

build().catch((err) => {
    process.stderr.write((err && err.stack) ? `${err.stack}\n` : `${String(err)}\n`);
    process.exit(1);
});
