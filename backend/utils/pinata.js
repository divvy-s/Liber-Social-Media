const axios = require('axios');
const FormData = require('form-data');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

async function uploadToPinata(buffer, filename = 'file') {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const formData = new FormData();
  formData.append('file', buffer, filename);

  const headers = {
    ...formData.getHeaders(),
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_API_SECRET,
  };

  const response = await axios.post(url, formData, { headers });
  return response.data; // Contains IpfsHash, PinSize, Timestamp
}

module.exports = { uploadToPinata }; 