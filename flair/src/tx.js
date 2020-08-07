/*
  Copyright 2019 OmiseGO Pte Ltd
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
const fetch = require('node-fetch');

module.exports = {
  getAllBurned: async function ({watcher, burnAddr, curr, limit}, page = 1, transactions = []) {
    const body = {address: burnAddr, currency: curr, limit: limit, page: page};
	  const response = await fetch( `${ watcher }/transaction.all`, {
		  method: 'post',
		  body: JSON.stringify(body),
		  headers: {'Content-Type': 'application/json'}
	  });
	  const { data } = await response.json();
    if ( data.length === 0) {
      return transactions
    } else {
      return await this.getAllBurned({watcher, burnAddr, curr, limit}, page +1, [ ...transactions, ...data ])
    }
  }
}
