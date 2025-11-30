import { Card } from '@/components/ui/Card';
import { Music, Users, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
    // TODO: Fetch real stats
    const stats = [
        { label: 'Total Songs', value: '350', icon: Music, color: 'text-blue-500' },
        { label: 'Active Students', value: '12', icon: Users, color: 'text-green-500' },
        { label: 'Catalogues', value: '45', icon: FolderOpen, color: 'text-orange-500' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="flex items-center p-6">
                        <div className={`w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mr-4 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
