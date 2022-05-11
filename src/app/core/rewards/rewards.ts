export interface Reward {
  id: string;
  markdown: string;
  title: string;
  isActive?: boolean;
  s3Structure?: any;
}

export interface S3Structure {
  link: string;
  name: string;
  type: string;
  members?: S3Structure[];
}
