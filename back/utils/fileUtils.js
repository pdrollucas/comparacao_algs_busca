const fs = require('fs');
const path = require('path');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

module.exports = { uploadPath };