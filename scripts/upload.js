const axios = require('axios');
const fs = require('fs');

const CATBOX_API_URL = 'https://catbox.moe/user/api.php';

async function uploadToCatbox(filepath) {
  console.log(`Uploading ${filepath} to Catbox...`);
  
  try {
    const fileStream = fs.createReadStream(filepath);
    const stats = fs.statSync(filepath);
    
    const formData = new FormData();
    formData.append('reqtype', 'fileUpload');
    formData.append('fileToUpload', fileStream, {
      filename: path.basename(filepath),
      contentType: 'video/mp4',
      knownLength: stats.size
    });
    
    const response = await axios.post(CATBOX_API_URL, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    if (response.data && response.data.startsWith('https://')) {
      console.log(`✓ Upload successful: ${response.data}`);
      return response.data;
    } else {
      throw new Error(`Unexpected response: ${response.data}`);
    }
  } catch (error) {
    console.error(`✗ Upload failed:`, error.message);
    throw error;
  }
}

const filepath = process.argv[2];

if (!filepath) {
  console.error('Usage: node upload.js <filepath>');
  process.exit(1);
}

if (!fs.existsSync(filepath)) {
  console.error(`File not found: ${filepath}`);
  process.exit(1);
}

uploadToCatbox(filepath)
  .then(url => {
    console.log('\n✓ Catbox URL:', url);
  })
  .catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
