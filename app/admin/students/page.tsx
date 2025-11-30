import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default async function AdminStudentsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: students } = await supabase
        .from('students')
        .select('*')
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Students</h1>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                </Button>
            </div>

            <div className="bg-bg-secondary border border-border-default rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-bg-elevated border-b border-border-subtle">
                        <tr>
                            <th className="px-6 py-3 font-medium text-text-secondary">Name</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Level</th>
                            <th className="px-6 py-3 font-medium text-text-secondary">Status</th>
                            <th className="px-6 py-3 font-medium text-text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {students?.map((student) => (
                            <tr key={student.id} className="hover:bg-bg-tertiary/50">
                                <td className="px-6 py-4 font-medium">{student.name}</td>
                                <td className="px-6 py-4">Lvl {student.default_level}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${student.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {student.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </td>
                            </tr>
                        ))}
                        {(!students || students.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
