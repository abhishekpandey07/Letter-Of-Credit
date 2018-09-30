import axios from 'axios';

/**
 * @param {String} path : contains path to API CALL
 * @param {Object} payload : contains an object to be sent
 * @param {Object} query : request Query Params. only used if method == GET
 * @param {String} method : One of 'GET','POST','PUT','PATCH','DELETE'
 */
async function request(path,payload,query,method){
  const options = {
    credentials: 'include',
    method: method.toLocaleLowerCase(),
    data: payload,
    url: path,
    params: query
  }
  return axios.request(options)
}

export {
  request
}


