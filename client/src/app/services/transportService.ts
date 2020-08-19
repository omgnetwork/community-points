import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import JSONBigNumber from 'omg-json-bigint';

function getTransformResponse () {
  return [(data) => data];
}

function parseResponse (res: AxiosResponse): any {
  try {
    const response = JSONBigNumber.parse(res.data);
    if (response.success) {
      return response.data;
    }
    if (!response.success) {
      throw new Error(JSON.stringify(response.data));
    }
  } catch (error) {
    throw new Error(`Unable to parse response from server: ${error.message}`);
  }
}

interface IPost {
  url: string,
  body: {[ key: string]: any },
  rpc?: boolean
}

export async function post ({ url, body, rpc = true }: IPost): Promise<any> {
  if (rpc) {
    body.jsonrpc = body.jsonrpc || '2.0';
    body.id = body.id || 0;
  }

  const options: AxiosRequestConfig = {
    method: 'POST',
    url,
    headers: { 'Content-Type': 'application/json' },
    data: JSONBigNumber.stringify(body),
    transformResponse: getTransformResponse(),
    validateStatus: _ => {
      return true;
    }
  };
  const res = await axios.request(options);
  return parseResponse(res);
};

export async function get ({ url }): Promise<any> {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url
  };
  const result = await axios(options);
  return result.data;
};
