// public/js/apiAdmin.js

const LOCAL_ROOT = 'http://gs.ev0-games.com:4021/api';
console.log('apiAdmin.js loaded.');

// Helper to decode JWT token
function parseJwt(token) {
  try {
    // Remove Bearer prefix if present
    const actualToken = token.replace('Bearer ', '');
    const base64Url = actualToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
}

async function localRequest(method, url, data) {
  let fullUrl = LOCAL_ROOT + url + '?nocache=' + Date.now();
  if (method === 'get' && data) {
    for (const k in data) fullUrl += `&${k}=${encodeURIComponent(data[k])}`;
  }
  console.log(`→ ADMIN LOCAL ${method.toUpperCase()} ${fullUrl}`);

  const token = localStorage.getItem('adminToken');
  console.log('Current token:', token ? 'Present' : 'Missing');
  
  if (token) {
    const decoded = parseJwt(token);
    if (decoded) {
      console.log('Token payload:', decoded);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log('Token has expired');
        localStorage.removeItem('adminToken');
        throw new Error('Token has expired');
      }
    }
  }

  const authHeader = token ? `Bearer ${token.replace('Bearer ', '')}` : '';

  const opts = {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json'
    },
    credentials: 'include',
    mode: 'cors'
  };

  if (method !== 'get') opts.body = JSON.stringify(data);

  console.log('Request headers:', opts.headers);

  try {
    const res = await fetch(fullUrl, opts);
    const json = await res.json();
    
    if (!res.ok) {
      console.error('API Error:', {
        status: res.status,
        statusText: res.statusText,
        response: json,
        url: fullUrl,
        headers: opts.headers
      });
      
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/';
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(json.error || `HTTP ${res.status}`);
    }
    return json;
  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw e;
  }
}

// Export auth functions
export const authAdmin = {
  slogin: creds => localRequest('post', '/slogin', creds),
  logout: () => localRequest('get', '/logout')
};



// Export user management functions (all prefixed with /s)
export const adminUser = {
  getList:        params => localRequest('get', '/s/users', params),
  getOnlineUsers:        () => localRequest('get', '/s/users_con'),
  getPendingUsers:       () => localRequest('get', '/s/users_req'),
  approve:        (uid, data) => localRequest('put', `/s/user_approve/${uid}`, data),
  getInfo:        uid         => localRequest('get', `/s/user/${uid}`),
  getInfoByIdx:   idx         => localRequest('get', `/s/user_by_idx/${idx}`),  
  update:         (uid, data) => localRequest('put', `/s/user/${uid}`, data),
  updateFull:     (idx, data) => localRequest('put', `/s/user_full_update/${idx}`, data),
  create:         data        => localRequest('post', '/s/user', data),
  ban:            data        => localRequest('put', '/s/user_ban', data),
  chipExchange:   data        => localRequest('post', '/s/user_ex', data),
  getRoleList:            () => localRequest('get', '/s/role_list'),
  delete:         idx         => localRequest('put', `/s/user_delete/${idx}`),
  changePassword: (idx, data) => localRequest('put', `/s/user_password/${idx}`, data),

   // To this:
   getRechargeRequests: params =>
    localRequest('get', '/s/chip_ex/list', params),
  approveRecharge: id =>
    localRequest('post', `/s/chip_ex/${id}/approve`, { action:'approve' }),
  rejectRecharge: id =>
    localRequest('post', `/s/chip_ex/${id}/approve`, { action:'reject' })
};


export const getAllEvents = async () => {
  try {
    const response = await localRequest('get', '/all-events');
    console.log('API Response:', response); // Log the response to see the structure
    return response.events; // Assuming the API returns { events: [...] }
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw error;
  }
};

export const gameEvent = {
  create: data => localRequest('post', '/game-event/create', data),
  update: (id, data) => localRequest('put', `/game-event/${id}`, data),
  delete: id => {
    if (!id) throw new Error('Event ID is required');
    return localRequest('put', `/game-event/${id}/delete`, { state: 1 });
},
  getById: id => {
    if (!id) throw new Error('Event ID is required');
    return localRequest('get', `/game-event/${id}`);
  }
};

// For backward compatibility with non-module scripts
window.authAdmin = authAdmin;
window.adminUser = adminUser;
