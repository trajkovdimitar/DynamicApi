import { useEffect } from 'react';

interface Props {
    message: string;
    onClose: () => void;
}

export default function Toast({ message, onClose }: Props) {
    useEffect(() => {
        if (!message) return;
        const id = setTimeout(onClose, 3000);
        return () => clearTimeout(id);
    }, [message, onClose]);

    if (!message) return null;
    return (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow">
            {message}
        </div>
    );
}
