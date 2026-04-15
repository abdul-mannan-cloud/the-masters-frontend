import axios from 'axios';

export async function apiGlobalSearch(query, { signal, limit = 5, types } = {}) {
    const params = { q: query, limit };
    if (types && types.length) params.types = types.join(',');
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/search`, { params, signal });
    return res.data;
}
