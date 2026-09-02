import axiosInstance from './axiosInstance';


export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const fetchCurrentUser = async () => {
  const { data } = await axiosInstance.get('/api/auth/me');
  const user = data?.user || data?.data?.user || data?.data || data;

  if (user && (user.email || user._id || user.id)) {
    setCurrentUser(user);
    return user;
  }

  return null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const updateProfile = async (payload) => {
  const { data } = await axiosInstance.put('/api/auth/profile', payload);
  return data?.user || data?.data?.user || data;
};
