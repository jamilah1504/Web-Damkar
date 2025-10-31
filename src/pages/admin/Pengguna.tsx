import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Stack, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel,
    Pagination // Pastikan Pagination diimpor
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import api from '../../api';
import Swal from 'sweetalert2';

// Definisikan tipe data untuk pengguna
interface User {
    id: number | string;
    name: string;
    email: string;
    role: string;
    password?: string;
    nomorInduk?: string;
    pangkat?: string;
}

// Definisikan tipe untuk response paginasi dari backend
interface PaginatedUsersResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    users: User[];
}

const AdminPengguna: React.FC = () => {
    const [pengguna, setPengguna] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Masyarakat' });

    useEffect(() => {
        fetchPengguna(currentPage);
    }, [currentPage]);

    // PERBAIKI FUNGSI INI
    const fetchPengguna = async (page: number) => {
        try {
            setLoading(true);
            const response = await api.get<PaginatedUsersResponse>(`/users?page=${page}&size=10`);
            
            // Ambil array 'users' dari dalam objek response
            setPengguna(response.data.users); 
            
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (err) {
            setError('Gagal memuat data pengguna.');
            // Set pengguna ke array kosong jika terjadi error untuk mencegah crash
            setPengguna([]); 
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        if (user) {
            setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
        } else {
            setFormData({ name: '', email: '', password: '', role: 'Masyarakat' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
                Swal.fire({
                    target: document.body,
                    customClass: {
                        container: 'highest-z-index' // TAMBAHKAN INI
                    },
                    title: 'Berhasil!',
                    text: 'Data pengguna telah diperbarui.',
                    icon: 'success'
                });
            } else {
                await api.post('/users', formData);
                Swal.fire({
                    target: document.body,
                    customClass: {
                        container: 'highest-z-index' // TAMBAHKAN INI
                    },
                    title: 'Berhasil!',
                    text: 'Pengguna baru telah ditambahkan.',
                    icon: 'success'
                });
            }
            handleCloseModal();
            fetchPengguna(currentPage);
        } catch (err: any) {
            Swal.fire({
                target: document.body,
                customClass: {
                    container: 'highest-z-index' // TAMBAHKAN INI
                },
                title: 'Oops...',
                text: err.response?.data?.message || 'Terjadi kesalahan.',
                icon: 'error'
            });
        }
    };
    
    const handleDelete = (id: number | string) => {
        Swal.fire({
            target: document.body, // Tetap gunakan ini
            customClass: {
                container: 'highest-z-index' // TAMBAHKAN INI
            },
            title: 'Anda yakin?',
            text: "Tindakan ini tidak dapat dibatalkan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/users/${id}`);
                    Swal.fire({
                        target: document.body,
                        customClass: {
                            container: 'highest-z-index' // TAMBAHKAN DI SINI JUGA
                        },
                        title: 'Dihapus!',
                        text: 'Pengguna telah berhasil dihapus.',
                        icon: 'success'
                    });
                    if (pengguna.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        fetchPengguna(currentPage);
                    }
                } catch (err) {
                    Swal.fire({
                        target: document.body,
                        customClass: {
                            container: 'highest-z-index' // TAMBAHKAN DI SINI JUGA
                        },
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan saat menghapus pengguna.',
                        icon: 'error'
                    });
                }
            }
        });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;

    return (
        <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
             <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>Manajemen Pengguna</Typography>
                    <Typography variant="body1" color="text.secondary">Kelola akun dan hak akses pengguna sistem.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    Tambah Pengguna
                </Button>
            </Stack>

            <TableContainer component={Paper}>
                 <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nama Lengkap</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Peran (Role)</TableCell>
                            <TableCell align="center">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Pemeriksaan ini sekarang aman karena 'pengguna' diinisialisasi sebagai [] */}
                        {pengguna.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" color="primary" size="small" startIcon={<EditIcon />} sx={{ mr: 1 }} onClick={() => handleOpenModal(user)}>
                                        Edit
                                    </Button>
                                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(user.id)}>
                                        Hapus
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                />
            </Box>

             <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField autoFocus margin="dense" name="name" label="Nama Lengkap" type="text" fullWidth variant="outlined" value={formData.name} onChange={handleFormChange} />
                        <TextField margin="dense" name="email" label="Alamat Email" type="email" fullWidth variant="outlined" value={formData.email} onChange={handleFormChange} />
                        <TextField margin="dense" name="password" label="Password" type="password" fullWidth variant="outlined" value={formData.password} onChange={handleFormChange} placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah' : ''} />
                        <FormControl fullWidth>
                            <InputLabel>Peran (Role)</InputLabel>
                            <Select name="role" value={formData.role} label="Peran (Role)" onChange={handleFormChange as any}>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Petugas">Petugas</MenuItem>
                                <MenuItem value="Masyarakat">Masyarakat</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Batal</Button>
                    <Button onClick={handleSubmit} variant="contained">Simpan</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminPengguna;