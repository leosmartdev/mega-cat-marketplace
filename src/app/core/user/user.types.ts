import { Role } from '../models/role';
import firebase from 'firebase/compat/app';

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  bio: string;
  avatar?: string;
  banner?: string;
  role: Role;
  status?: string;
  accessToken?: string;
  refreshToken?: string;
  isFirebaseUser?: boolean;
  firebaseUser?: firebase.User;
  username?: string;
  walletAddresses?: string[];
  linkedWalletAddresses?: string[];
}

export interface UserPayload {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface MongoUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  usernameOrEmail: string;
  role: string;
}
