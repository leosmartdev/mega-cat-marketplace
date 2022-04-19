import { AuthUtils } from './auth.utils';

describe('AuthUtils', () => {
  let utils: AuthUtils;
  const offsetSeconds = 0;

  beforeAll(() => {
    spyOn<any>(AuthUtils, 'pageReload').and.callFake(() => {
      console.log('Page Reloaded!');
    });

    window.onbeforeunload = jasmine.createSpy();
  });

  beforeEach(() => {
    utils = new AuthUtils();
    let store = {};
    const mockLocalStorage = {
      getItem: (key: string): string => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
  });

  it('should be created', () => {
    expect(utils).toBeTruthy();
  });

  describe('isTokenExpired', () => {
    it('should return true if token is empty', () => {
      const token = '';
      expect(AuthUtils.isTokenExpired(token, offsetSeconds)).toBe(true);
    });

    it('should return true if token is null', () => {
      const token = null;
      expect(AuthUtils.isTokenExpired(token, offsetSeconds)).toBe(true);
    });

    it('should return true when date is null', () => {
      const token = 'ACC3.SST0.K3N';
      spyOn<any>(AuthUtils, '_getTokenExpirationDate').and.returnValue(null);
      expect(AuthUtils.isTokenExpired(token, offsetSeconds)).toBe(true);
    });

    it('should return true', () => {
      const token = 'ACC3.SST0.K3N';
      spyOn<any>(AuthUtils, '_getTokenExpirationDate').and.returnValue(new Date());
      expect(AuthUtils.isTokenExpired(token, offsetSeconds)).toBe(true);
    });
  });

  describe('GetTokenExpirationDate', () => {
    const token = 'ACC3.SST0.K3N';
    it('should return null when token cannot be decoded', () => {
      spyOn<any>(AuthUtils, '_decodeToken').and.returnValue({});
      expect((AuthUtils as any)._getTokenExpirationDate(token)).toBe(null);
    });

    it('should return token expiration date correctly', () => {
      spyOn<any>(AuthUtils, '_decodeToken').and.returnValue({ exp: '1/1/1970' });
      expect((AuthUtils as any)._getTokenExpirationDate(token)).toBeTruthy();
    });
  });

  describe('DecodeToken', () => {
    it('should return null when token is null', () => {
      const token = null;
      expect((AuthUtils as any)._decodeToken(token)).toBe(null);
    });

    it('should throw when token is not valid JWT', () => {
      const token = 'INVALID.TOKEN';
      expect(() => {
        (AuthUtils as any)._decodeToken(token);
      }).toThrowError("The inspected token doesn't appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.");
    });

    it('should throw an error when token part cannot be decoded', () => {
      const token = 'ACC3.SST0.K3N';
      spyOn<any>(AuthUtils, '_urlBase64Decode').and.returnValue(null);
      expect(() => {
        (AuthUtils as any)._decodeToken(token);
      }).toThrowError('Cannot decode the token.');
    });

    it('should decode token', () => {
      const token = 'ACC3.SST0.K3N';
      const tokenContent = { key: 'data' };
      spyOn<any>(AuthUtils, '_urlBase64Decode').and.returnValue(JSON.stringify(tokenContent));
      expect((AuthUtils as any)._decodeToken(token)).toEqual(tokenContent);
    });
  });

  describe('UrlBase64Decode', () => {
    it('should return the original string', () => {
      const str = 'xxxx';
      spyOn<any>(AuthUtils, '_b64DecodeUnicode').and.returnValue(str);
      expect((AuthUtils as any)._urlBase64Decode(str)).toEqual('xxxx');
    });

    it('should return string with ==', () => {
      const str = 'xxxxxx';
      const expectedResponse = 'xxxxxx==';
      spyOn<any>(AuthUtils, '_b64DecodeUnicode').and.returnValue(expectedResponse);
      expect((AuthUtils as any)._urlBase64Decode(str)).toEqual('xxxxxx==');
    });

    it('should return string with =', () => {
      const str = 'xxxxxxx';
      const expectedResponse = 'xxxxxxx=';
      spyOn<any>(AuthUtils, '_b64DecodeUnicode').and.returnValue(expectedResponse);
      expect((AuthUtils as any)._urlBase64Decode(str)).toEqual('xxxxxxx=');
    });

    it('should throw an error', () => {
      const str = 'xxxxx';
      expect(() => (AuthUtils as any)._urlBase64Decode(str)).toThrow(new Error('Illegal base64url string!'));
    });
  });

  describe('B64DecodeUnicode', () => {
    it('should return the decoded value of the string', () => {
      const str = 'xxxxxxx';
      spyOn<any>(AuthUtils, '_b64decode').and.returnValue(str);
      expect((AuthUtils as any)._b64DecodeUnicode(str)).toEqual('xxxxxxx');
    });
  });

  describe('B64decode', () => {
    it('should decode the string successfully', () => {
      const str = 'z$z+zz';
      expect((AuthUtils as any)._b64decode(str)).toEqual('Ï?³');
    });

    it('should throw an error when invalid string is passed', () => {
      const str = 'xxxxx';
      expect(() => (AuthUtils as any)._b64decode(str)).toThrowError("'atob' failed: The string to be decoded is not correctly encoded.");
    });
  });
});
