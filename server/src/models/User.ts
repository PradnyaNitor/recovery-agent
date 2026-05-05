import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class UserModel {
  static create(data: CreateUserData): Omit<User, 'created_at' | 'updated_at'> {
    return {
      id: uuidv4(),
      email: data.email.toLowerCase(),
      password_hash: data.password,
      name: data.name
    };
  }
}