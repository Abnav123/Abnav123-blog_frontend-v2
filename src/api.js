const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '' : 'https://blog-backend-8efx.onrender.com');

// Helper to get auth header
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Helper for fetch calls
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(username, email, password) {
    return request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async login(email, password) {
    const data = await request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token and decode user information
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      // We also decode token to get the user ID
      const userId = decodeTokenUserId(data.token);
      
      // Save user session details (fallback to email prefix if username is not returned)
      const userSession = {
        token: data.token,
        userId: data.userId || userId,
        username: data.username || email.split('@')[0],
      };
      
      localStorage.setItem('user', JSON.stringify(userSession));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Debates
  async getDebates({ search, category, tag, status } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);
    if (status) params.append('status', status);

    const queryString = params.toString();
    const url = `/debates${queryString ? `?${queryString}` : ''}`;
    
    return request(url);
  },

  async getDebate(id) {
    return request(`/debates/${id}`);
  },

  async createDebate({ title, description, category, tags }) {
    return request('/debates', {
      method: 'POST',
      body: JSON.stringify({ title, description, category, tags }),
    });
  },

  async updateDebate(id, { title, description, category, tags }) {
    return request(`/debates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, description, category, tags }),
    });
  },

  async deleteDebate(id) {
    return request(`/debates/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleLike(id) {
    return request(`/debates/${id}/like`, {
      method: 'POST',
    });
  },

  async toggleBookmark(id) {
    return request(`/debates/${id}/bookmark`, {
      method: 'POST',
    });
  },

  async getBookmarkedDebates() {
    return request('/debates/bookmarks/me');
  },

  async closeDebate(id) {
    return request(`/debates/${id}/close`, {
      method: 'PATCH',
    });
  },

  async reopenDebate(id) {
    return request(`/debates/${id}/reopen`, {
      method: 'PATCH',
    });
  },

  // Arguments
  async getArguments(debateId) {
    return request(`/arguments/${debateId}`);
  },

  async addArgument({ content, side, debateId }) {
    return request('/arguments', {
      method: 'POST',
      body: JSON.stringify({ content, side, debateId }),
    });
  },
};

// Helper function to decode JWT userId
function decodeTokenUserId(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.userId;
  } catch (e) {
    console.error('Error decoding token', e);
    return null;
  }
}
