export class WizardStage {
  name: string;
  status: 'dormant' | 'active' | 'finished' | 'failed';
  description: string;
}
