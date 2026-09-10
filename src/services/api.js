const API_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      headers: {
        'Content-Type': 'application/json',

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...options.headers,
      },

      body: options.body
        ? JSON.stringify(options.body)
        : undefined,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error ||
      'Something went wrong'
    );
  }

  return data;
}


export const api = {

  /* ---------- AUTH ---------- */

  register: (
    name,
    handle,
    email,
    password
  ) =>
    request(
      '/auth/register',
      {
        method: 'POST',
        body: {
          name,
          handle,
          email,
          password,
        },
      }
    ),


  login: (
    email,
    password
  ) =>
    request(
      '/auth/login',
      {
        method: 'POST',
        body: {
          email,
          password,
        },
      }
    ),


  /* ---------- POSTS ---------- */

  getPosts: () =>
    request(
      '/posts',
      {
        method: 'GET',
      }
    ),


  createPost: (text) =>
    request(
      '/posts',
      {
        method: 'POST',
        body: {
          text,
        },
      }
    ),


  likePost: (id) =>
    request(
      `/posts/${id}/like`,
      {
        method: 'POST',
      }
    ),


  /* ---------- HISTORY ---------- */

  getHistory: () =>
    request(
      '/posts/history',
      {
        method: 'GET',
      }
    ),


  /* ---------- COMMENTS ---------- */

  addComment: (
    id,
    text
  ) =>
    request(
      `/posts/${id}/comment`,
      {
        method: 'POST',
        body: {
          text,
        },
      }
    ),


  getComments: (id) =>
    request(
      `/posts/${id}/comments`,
      {
        method: 'GET',
      }
    ),


  /* ---------- USERS ---------- */

  searchUsers: (
    query = ''
  ) =>
    request(
      `/users/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
      }
    ),


  getUser: (id) =>
    request(
      `/users/${id}`,
      {
        method: 'GET',
      }
    ),


  getUserPosts: (id) =>
    request(
      `/users/${id}/posts`,
      {
        method: 'GET',
      }
    ),

};