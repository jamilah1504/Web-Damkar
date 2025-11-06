import api from '../api';

export type UserDto = {
  id: number;
  name: string;
  email: string;
  role: 'Masyarakat' | 'Petugas' | 'Admin';
  nomorInduk?: string | null;
  pangkat?: string | null;
};

export async function getAllUsers(): Promise<UserDto[]> {
  const res = await api.get('/users');
  return res.data as UserDto[];
}

export async function getPetugasUsers(): Promise<UserDto[]> {
  const users = await getAllUsers();
  return users.filter((u) => u.role === 'Petugas');
}
