import { EncryptedValue } from './encrypted-value';

describe('EncryptedValue', () => {
  let encryptedValue: EncryptedValue;
  const keyId = '123456';
  const encryptedData = 'hswhduwdgtyewcjkdslqieuwyd';

  beforeEach(() => {
    encryptedValue = new EncryptedValue(encryptedData, keyId);
  });

  it('should be created', () => {
    expect(encryptedValue).toBeTruthy();
  });

  it('should convert to string sucessfully', () => {
    const expectedresponse = `{ encryptedData: ${encryptedData} , keyId: ${keyId} }`;
    const res = encryptedValue.toString();
    expect(res).toEqual(expectedresponse);
  });
});
