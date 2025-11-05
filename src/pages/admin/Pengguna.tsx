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
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'Masyarakat',
        nomorInduk: '',
        pangkat: ''
    });

    useEffect(() => {
        fetchPengguna(currentPage);
    }, [currentPage]);

    // PERBAIKI FUNGSI INI
    const fetchPengguna = async (page: number) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching users from API...');
            const response = await api.get(`/users?page=${page}&size=10`);
            console.log('API Response:', response.data);
            
            // Handle different response formats
            let users: User[] = [];
            let totalPagesCount = 0;
            let currentPageNum = page;
            
            // Check if response is paginated object
            if (response.data && typeof response.data === 'object') {
                // Case 1: Paginated response with { users: [], totalPages, currentPage }
                if (Array.isArray(response.data.users)) {
                    users = response.data.users;
                    totalPagesCount = response.data.totalPages || 0;
                    currentPageNum = response.data.currentPage || page;
                }
                // Case 2: Direct array response (fallback)
                else if (Array.isArray(response.data)) {
                    users = response.data;
                    totalPagesCount = 1;
                    currentPageNum = 1;
                }
                // Case 3: Check if data property exists
                else if (response.data.data && Array.isArray(response.data.data)) {
                    users = response.data.data;
                    totalPagesCount = response.data.totalPages || 1;
                    currentPageNum = response.data.currentPage || page;
                }
            }
            
            console.log('Processed users:', users);
            console.log('Total pages:', totalPagesCount);
            
            setPengguna(users);
            setTotalPages(totalPagesCount);
            setCurrentPage(currentPageNum);
            
        } catch (err: any) {
            console.error('Error fetching users:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);
            
            // Handle different error cases
            if (err.response?.status === 401) {
                setError('Sesi telah berakhir. Silakan login ulang.');
                // Redirect to login if needed
                setTimeout(() => {
                    localStorage.removeItem('user');
                    window.location.href = '/authentication/login';
                }, 2000);
            } else if (err.response?.status === 403) {
                setError('Anda tidak memiliki akses untuk mengakses halaman ini.');
            } else {
                setError(err.response?.data?.message || 'Gagal memuat data pengguna.');
            }
            
            // Set pengguna ke array kosong jika terjadi error untuk mencegah crash
            setPengguna([]);
            setTotalPages(0);
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
            setFormData({ 
                name: user.name || '', 
                email: user.email || '', 
                role: user.role || 'Masyarakat', 
                password: '',
                nomorInduk: user.nomorInduk || '',
                pangkat: user.pangkat || ''
            });
        } else {
            setFormData({ 
                name: '', 
                email: '', 
                password: '', 
                role: 'Masyarakat',
                nomorInduk: '',
                pangkat: ''
            });
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
            // Validasi form
            if (!formData.name || !formData.email) {
                Swal.fire({
                    target: document.body,
                    customClass: {
                        container: 'highest-z-index'
                    },
                    title: 'Validasi Gagal',
                    text: 'Nama dan Email harus diisi.',
                    icon: 'warning'
                });
                return;
            }

            if (!editingUser && !formData.password) {
                Swal.fire({
                    target: document.body,
                    customClass: {
                        container: 'highest-z-index'
                    },
                    title: 'Validasi Gagal',
                    text: 'Password harus diisi untuk pengguna baru.',
                    icon: 'warning'
                });
                return;
            }

            // Siapkan data untuk dikirim
            const submitData: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role
            };

            // Tambahkan password hanya jika ada (untuk edit) atau wajib (untuk create)
            if (formData.password) {
                submitData.password = formData.password;
            }

            // Tambahkan nomorInduk dan pangkat jika role bukan Masyarakat
            if (formData.role !== 'Masyarakat') {
                submitData.nomorInduk = formData.nomorInduk || null;
                submitData.pangkat = formData.pangkat || null;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, submitData);
                Swal.fire({
                    target: document.body,
                    customClass: {
                        container: 'highest-z-index'
                    },
                    title: 'Berhasil!',
                    text: 'Data pengguna telah diperbarui.',
                    icon: 'success'
                });
            } else {
                await api.post('/users', submitData);
                Swal.fire({
                    target: document.body,
                    customClass: {
                        container: 'highest-z-index'
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
                    container: 'highest-z-index'
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
                    if (Array.isArray(pengguna) && pengguna.length === 1 && currentPage > 1) {
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Box sx={{ p: 3, flexGrow: 1, bgcolor: '#fff4ea' }}>
                <Stack spacing={2}>
                    <Typography variant="h4" color="error" gutterBottom>
                        Error
                    </Typography>
                    <Typography color="error" variant="body1">
                        {error}
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            setError(null);
                            fetchPengguna(currentPage);
                        }}
                    >
                        Coba Lagi
                    </Button>
                </Stack>
            </Box>
        );
    }

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
                            <TableCell>Nomor Induk</TableCell>
                            <TableCell>Pangkat</TableCell>
                            <TableCell align="center">Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Pastikan pengguna adalah array sebelum memanggil .length */}
                        {(!Array.isArray(pengguna) || pengguna.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Tidak ada data pengguna
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            pengguna.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.nomorInduk || '-'}</TableCell>
                                    <TableCell>{user.pangkat || '-'}</TableCell>
                                    <TableCell align="center">
                                        <Button variant="outlined" color="primary" size="small" startIcon={<EditIcon />} sx={{ mr: 1 }} onClick={() => handleOpenModal(user)}>
                                            Edit
                                        </Button>
                                        <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(user.id)}>
                                            Hapus
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {totalPages > 0 && (
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
            )}

             <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField 
                            autoFocus 
                            margin="dense" 
                            name="name" 
                            label="Nama Lengkap" 
                            type="text" 
                            fullWidth 
                            variant="outlined" 
                            value={formData.name} 
                            onChange={handleFormChange}
                            required
                        />
                        <TextField 
                            margin="dense" 
                            name="email" 
                            label="Alamat Email" 
                            type="email" 
                            fullWidth 
                            variant="outlined" 
                            value={formData.email} 
                            onChange={handleFormChange}
                            required
                        />
                        <TextField 
                            margin="dense" 
                            name="password" 
                            label="Password" 
                            type="password" 
                            fullWidth 
                            variant="outlined" 
                            value={formData.password} 
                            onChange={handleFormChange} 
                            placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah' : ''}
                            required={!editingUser}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Peran (Role)</InputLabel>
                            <Select name="role" value={formData.role} label="Peran (Role)" onChange={handleFormChange as any}>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Petugas">Petugas</MenuItem>
                                <MenuItem value="Masyarakat">Masyarakat</MenuItem>
                            </Select>
                        </FormControl>
                        {formData.role !== 'Masyarakat' && (
                            <>
                                <TextField 
                                    margin="dense" 
                                    name="nomorInduk" 
                                    label="Nomor Induk" 
                                    type="text" 
                                    fullWidth 
                                    variant="outlined" 
                                    value={formData.nomorInduk} 
                                    onChange={handleFormChange}
                                    placeholder="Contoh: 123456"
                                />
                                <TextField 
                                    margin="dense" 
                                    name="pangkat" 
                                    label="Pangkat" 
                                    type="text" 
                                    fullWidth 
                                    variant="outlined" 
                                    value={formData.pangkat} 
                                    onChange={handleFormChange}
                                    placeholder="Contoh: Letnan Satu"
                                />
                            </>
                        )}
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