import { AuthManager } from '../../assets/js/modules/unified-auth.js';

const mockUser = {
  userId: '123',
  email: 'test@example.com',
  displayName: 'Test User'
};

AuthManager.saveSession(mockUser);
console.log('Current user after saveSession:', AuthManager.getCurrentUser());
