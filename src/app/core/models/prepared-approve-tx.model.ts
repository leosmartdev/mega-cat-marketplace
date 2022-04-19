export class PreparedApproveTx {
  type: string;
  to: string;
  secretType: string;
  value: number;
  functionName: string;
  inputs: Input[];
  data: string;
}

class Input {
  type: string;
  value: string;
}
