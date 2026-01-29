import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access');
  return {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  };
};

const api = {
  login: (username, password) =>axios.post(`${API_URL}/auth/login/`, { username, password }),
  register: (data) => axios.post(`${API_URL}/auth/register/`, data),
  getProfile: () => axios.get(`${API_URL}/auth/profile/`, getAuthHeaders()),
  updateProfile: (data) => axios.put(`${API_URL}/auth/profile/`, data, getAuthHeaders()),
  changePassword: (d1, d2) => axios.post(`${API_URL}/auth/change-password/`, { old_password: d1, new_password: d2 }, getAuthHeaders()),

  getFolders: (parentId = null, filter = null, search = null) => {
    let url = `${API_URL}/folders/?`;
    if (search) {
        url += `search=${search}&`;
    } else {
        if (parentId) url += `parent=${parentId}&`;
        if (filter) url += `filter=${filter}&`;
    }
    return axios.get(url, getAuthHeaders());
  },

  getFiles: (folderId = null, filter = null, search = null) => {
    let url = `${API_URL}/files/?`;
    if (search) {
        url += `search=${search}&`;
    } else {
        if (folderId) url += `folder=${folderId}&`;
        if (filter) url += `filter=${filter}&`;
    }
    return axios.get(url, getAuthHeaders());
  },

  createFolder: (name, parentId = null) => {
    return axios.post(`${API_URL}/folders/`, { name, parent: parentId }, getAuthHeaders());
  },

  uploadFile: (fileObj, folderId = null) => {
    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('name', fileObj.name);
    if (folderId) formData.append('folder', folderId);
    const config = getAuthHeaders();
    config.headers['Content-Type'] = 'multipart/form-data';
    return axios.post(`${API_URL}/files/`, formData, config);
  },

  rename: (id, type, newName) => axios.patch(`${API_URL}/${type}/${id}/`, { name: newName }, getAuthHeaders()),
  move: (id, type, targetFolderId) => axios.post(`${API_URL}/${type}/${id}/move/`, { target_folder_id: targetFolderId }, getAuthHeaders()),
  getStorageUsage: () => axios.get(`${API_URL}/storage/`, getAuthHeaders()),
  share: (id, type, username) => axios.post(`${API_URL}/${type}/${id}/share/`, { username }, getAuthHeaders()),
  getDownloadLink: (id) => axios.get(`${API_URL}/files/${id}/get_link/`, getAuthHeaders()),
  
  toggleStar: (id, type) => axios.post(`${API_URL}/${type}/${id}/toggle_star/`, {}, getAuthHeaders()),
  toggleTrash: (id, type) => axios.post(`${API_URL}/${type}/${id}/toggle_trash/`, {}, getAuthHeaders()),
  toggleSpam: (id, type) => axios.post(`${API_URL}/${type}/${id}/toggle_spam/`, {}, getAuthHeaders()),
  deletePermanently: (id, type) => axios.delete(`${API_URL}/${type}/${id}/`, getAuthHeaders()),
};

export default api;