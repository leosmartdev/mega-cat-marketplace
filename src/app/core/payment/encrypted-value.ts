export class EncryptedValue {
  encryptedData: string;
  keyId: string;

  constructor(encryptedData, keyId) {
    this.encryptedData = encryptedData;
    this.keyId = keyId;
  }

  public toString(): string {
    return `{ encryptedData: ${this.encryptedData} , keyId: ${this.keyId} }`;
  }
}

EncryptedValue.prototype.toString = function overrideString() {
  return `{ encryptedData: ${this.encryptedData} , keyId: ${this.keyId} }`;
};
