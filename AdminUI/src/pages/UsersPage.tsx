import { useState } from 'react';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Breadcrumb } from '../components/Breadcrumb';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer' },
    ]);

    const [editing, setEditing] = useState<User | null>(null);

    const startEdit = (user: User) => {
        setEditing({ ...user });
    };

    const save = () => {
        if (!editing) return;
        setUsers(prev => prev.map(u => (u.id === editing.id ? editing : u)));
        setEditing(null);
    };

    const columns = [
        { header: 'Name', accessor: (u: User) => u.name },
        { header: 'Email', accessor: (u: User) => u.email },
        { header: 'Role', accessor: (u: User) => u.role },
        {
            header: 'Actions',
            accessor: (u: User) => (
                <Button size="sm" onClick={() => startEdit(u)}>
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Users' }]} />
            <h2 className="text-xl font-semibold">Users</h2>
            <DataTable columns={columns} data={users} />
            <Drawer open={editing !== null} onClose={() => setEditing(null)}>
                {editing && (
                    <div className="p-4 space-y-4">
                        <h3 className="text-lg font-semibold">Edit User</h3>
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <Input
                                value={editing.name}
                                onChange={e =>
                                    setEditing({ ...editing, name: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <Input
                                value={editing.email}
                                onChange={e =>
                                    setEditing({ ...editing, email: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Role</label>
                            <Input
                                value={editing.role}
                                onChange={e =>
                                    setEditing({ ...editing, role: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setEditing(null)}>
                                Cancel
                            </Button>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}

