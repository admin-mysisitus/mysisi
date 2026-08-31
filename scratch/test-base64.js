import { Base64Utils } from '../../assets/js/modules/unified-utils.js';

const data = {
  user: { userId: '123', displayName: 'Budi 🚀' }
};

try {
  const encoded = Base64Utils.encode(JSON.stringify(data));
  console.log('Encoded:', encoded);
  const decoded = Base64Utils.decode(encoded);
  console.log('Decoded:', decoded);
} catch (e) {
  console.error('Error:', e);
}
