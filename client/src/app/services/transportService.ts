import axios, { AxiosResponse } from 'axios';
import JSONBigNumber from 'omg-json-bigint';

function getTransformResponse () {
  return [(data) => data];
}

function parseResponse (res: AxiosResponse): any {
  let data;
  try {
    data = JSONBigNumber.parse(res.data);
  } catch (err) {
    throw new Error(`Unable to parse response from server: ${err}`);
  }

  if (data.success) {
    return data.data;
  }
  throw new Error(data.data);
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

  const options = {
    method: 'POST',
    url,
    headers: { 'Content-Type': 'application/json' },
    data: JSONBigNumber.stringify(body),
    transformResponse: getTransformResponse()
  };
  const res = await axios.request(options as any);
  return parseResponse(res);
};

export async function get ({ url }): Promise<any> {
  const options = {
    method: 'GET',
    url
  };
  return axios(options as any);
};
