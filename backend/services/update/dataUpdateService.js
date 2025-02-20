const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const patchesDir = path.join(__dirname, '../../../patches');
const baseUrl = 'https://bnshongmoon.com/api/dataupdate';

// Tính toán hash SHA256 của file
function calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => {
            const fileHash = hash.digest('hex');
            console.log(`Hash của file ${filePath}: ${fileHash}`); // Log mã hash
            resolve(fileHash);
        });
        stream.on('error', reject);
    });
}

// Tạo manifest.json
async function generateManifest() {
    console.log('Bắt đầu tạo manifest mới...'); // Log để kiểm tra khi hàm được gọi

    const files = fs.readdirSync(patchesDir).filter((file) => file !== 'manifest.json');
    const manifest = { files: [] };

    for (const file of files) {
        const filePath = path.join(patchesDir, file);
        const fileHash = await calculateFileHash(filePath); // Tính toán lại hash của mỗi file
        manifest.files.push({
            name: file,
            hash: fileHash, // Cập nhật hash mới của file
            url: `${baseUrl}/${file}`,
        });
    }

    // Log để kiểm tra nội dung manifest
    console.log('Nội dung manifest trước khi ghi lại:', JSON.stringify(manifest, null, 2));

    // Ghi lại manifest mới với hash đã thay đổi
    fs.writeFileSync(path.join(patchesDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
    console.log('Manifest đã được cập nhật với hash mới!');

    return manifest;
}

// Lấy manifest.json
function getManifests() {
    const manifestPath = path.join(patchesDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
        throw new Error('Manifest file not found.');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    return manifest;
}

// Lấy file cập nhật
function getFile(fileName) {
    const filePath = path.join(patchesDir, fileName);

    if (!fs.existsSync(filePath)) {
        throw new Error('File not found.');
    }

    return filePath;
}

module.exports = {
    generateManifest,
    getManifests,
    getFile,
};
