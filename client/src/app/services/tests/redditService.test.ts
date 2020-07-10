import { parseThreadJSON } from 'app/services/redditService';
import mockData from './mockThreadData.json';

function makeMock (comments: Object[]) {
  return [
    {},
    {
      data: {
        children: comments
      }
    }
  ];
}

describe('redditService', () => {
  test('it should parse full raw json correctly', () => {
    const result = parseThreadJSON(mockData);
    const expected = [
      {
        author: 'OMGitty',
        address: '0x434e2863a78752166ffd5ed883607cbaf74f3858',
        created: 1594318794
      },
      {
        author: 'Ok_Swordfish6794',
        address: '0xcee05bf5b86aa9369b4676a2df518545e7e6d38f',
        created: 1594318221
      }
    ];
    expect(result).toEqual(expected);
  });

  test('should ignore no address comments', () => {
    const mock = makeMock([
      {
        data: {
          body: 'no address here',
          author: 'toto',
          created: 1
        }
      },
      {
        data: {
          body: 'no address blah0xA013DEBD703E28AF78C2ffD0264ef70F978C5465',
          author: 'toto',
          created: 1
        }
      },
      {
        data: {
          body: '0xA013DEBD703E28AF78C2ffD0264ef70F978C5465',
          author: 'foo',
          created: 1
        }
      }
    ]);
    const result = parseThreadJSON(mock);
    expect(result).toEqual([{
      address: '0xa013debd703e28af78c2ffd0264ef70f978c5465',
      author: 'foo',
      created: 1
    }]);
  });

  test('should take latest comment from author', () => {
    const mock = makeMock([
      {
        data: {
          body: '0xA013DEBD703E28AF78C2ffD0264ef70F978C5462',
          author: 'foo',
          created: 2
        }
      },
      {
        data: {
          body: '0xA013DEBD703E28AF78C2ffD0264ef70F978C5465',
          author: 'foo',
          created: 3
        }
      },
      {
        data: {
          body: '0xA013DEBD703E28AF78C2ffD0264ef70F978C5461',
          author: 'foo',
          created: 1
        }
      }
    ]);
    const result = parseThreadJSON(mock);
    expect(result).toEqual([{
      address: '0xa013debd703e28af78c2ffd0264ef70f978c5465',
      author: 'foo',
      created: 3
    }]);
  });

  test('should take latest comments for multiple authors', () => {
    const mock = makeMock([
      {
        data: {
          body: '0xA013DEBD703E28AF78C2ffD0264ef70F978C5462',
          author: 'foo',
          created: 2
        }
      },
      {
        data: {
          body: '0xA013DEBD703E28AF78C2ffD0264ef70F978C5465',
          author: 'foo',
          created: 3
        }
      },
      {
        data: {
          body: '0xA013DEBD703E28AF78C2ffD0264ef70F978C5461',
          author: 'foo',
          created: 1
        }
      },
      {
        data: {
          body: '0x434e2863A78752166FFd5ED883607CbAf74F3858',
          author: 'bar',
          created: 2
        }
      },
      {
        data: {
          body: '0x434e2863A78752166FFd5ED883607CbAf74F3858',
          author: 'bar',
          created: 3
        }
      },
      {
        data: {
          body: '0x434e2863A78752166FFd5ED883607CbAf74F3858',
          author: 'bar',
          created: 1
        }
      }
    ]);
    const result = parseThreadJSON(mock);
    expect(result).toEqual([
      {
        address: '0xa013debd703e28af78c2ffd0264ef70f978c5465',
        author: 'foo',
        created: 3
      },
      {
        address: '0x434e2863a78752166ffd5ed883607cbaf74f3858',
        author: 'bar',
        created: 3
      }
    ]);
  });
});
