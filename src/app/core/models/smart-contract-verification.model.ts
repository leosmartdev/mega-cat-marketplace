export class SmartContractVerification {
  exists: boolean;
  areOwner: boolean;
  hasMintRole: boolean;
  hasMint: boolean;
  hasMintBatch: boolean;

  constructor(exists, areOwner, hasMintRole, hasMint, hasMintBatch) {
    this.exists = exists;
    this.areOwner = areOwner;
    this.hasMintRole = hasMintRole;
    this.hasMint = hasMint;
    this.hasMintBatch = hasMintBatch;
  }
}
