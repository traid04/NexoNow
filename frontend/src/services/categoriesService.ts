import Axios from 'axios';
const baseUrl = 'api/categories';

const getCategories = async () => {
  const request = await Axios.get(`http://localhost:3000/${baseUrl}`);
  return request.data;
}

export default getCategories;