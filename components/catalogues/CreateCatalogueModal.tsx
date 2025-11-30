import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';

interface CreateCatalogueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description?: string; color?: string }) => Promise<void>;
}

export const CreateCatalogueModal = ({ isOpen, onClose, onSubmit }: CreateCatalogueModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#6366f1');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ title, description, color });
            onClose();
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const colors = ['#6366f1', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-bg-elevated border border-border-default rounded-lg w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                    <h3 className="font-bold text-lg">Create New Catalogue</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My Practice List"
                        required
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text-secondary">Description</label>
                        <textarea
                            className="w-full bg-bg-secondary border border-border-default rounded-md px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 min-h-[80px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Color</label>
                        <div className="flex gap-2">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-bg-elevated' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>Create Catalogue</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
