const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./app', function(filePath) {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;

        // Strip the import entirely
        newContent = newContent.replace(/import\s+(?:\{[^}]*NeuralIdentityTerminal[^}]*\}|NeuralIdentityTerminal)\s+from\s+['"][^'"]+['"];?\n?/g, '');
        
        // Strip out the component and its direct wrappers
        // Match <div className="relative z-50 w-full">\s*<NeuralIdentityTerminal className="mb-0" />\s*</div>
        newContent = newContent.replace(/<div\s+className=["']relative\s+z-50\s+w-full["']>\s*<NeuralIdentityTerminal[^>]*\/>\s*<\/div>\n?/g, '');
        
        // Match naked calls just in case
        newContent = newContent.replace(/<NeuralIdentityTerminal[^>]*\/>\n?/g, '');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Purged Terminal from:', filePath);
        }
    }
});
