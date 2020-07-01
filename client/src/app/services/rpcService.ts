import axios from 'axios';
import JSONBigNumber from 'omg-json-bigint';

function getTransformResponse () {
  return [(data) => data];
}

async function parseResponse (res) {
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

export async function post ({ url, body }) {
  body.jsonrpc = body.jsonrpc || '2.0';
  body.id = body.id || 0;
  try {
    const options = {
      method: 'POST',
      url: url,
      headers: { 'Content-Type': 'application/json' },
      data: JSONBigNumber.stringify(body),
      transformResponse: getTransformResponse()
    };
    const res = await axios.request(options as any);
    return parseResponse(res);
  } catch (err) {
    throw new Error(err);
  }
};
