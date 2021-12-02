import axios from "axios";

export const post = <T>(path: string, data: any): Promise<T> => {
  return axios.post(path, data).then((response) => {
    return response.data as T;
  });
};

export const get = <T>(path: string): Promise<T> => {
  return axios.get(path).then((response) => {
    return response.data as T;
  });
};

export const deleteObject = <T>(path: string): Promise<T> => {
  return axios.delete(path).then((response) => {
    return response.data as T;
  });
};

export const put = <T>(path: string, data: any): Promise<T> => {
  return axios.put(path, data).then((response) => {
    return response.data as T;
  });
};
