import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchEntities } from '../services/search';
import { Input } from './common/Input';

interface SearchResult {
    type: 'model' | 'rule' | 'workflow';
    name: string;
    path: string;
}


export function SearchBar() {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (q.length < 2) {
            setResults([]);
            return;
        }
        searchEntities(q)
            .then(res => {
                const r: SearchResult[] = [];
                res.models.forEach(m => r.push({ type: 'model', name: m.modelName, path: `/models/${m.modelName}` }));
                res.rules.forEach(rw => r.push({ type: 'rule', name: rw.workflowName, path: `/rules` }));
                res.workflows.forEach(w => r.push({ type: 'workflow', name: w.workflowName, path: `/workflows` }));
                setResults(r);
            })
            .catch(() => setResults([]));
    }, [q]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setResults([]);
        };
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <Input
                placeholder="Search"
                value={q}
                onChange={e => setQ(e.target.value)}
                aria-label="Global search"
            />
            {results.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 max-h-64 overflow-y-auto border border-gray-300 bg-white dark:bg-gray-800">
                    {results.map((r, idx) => (
                        <Link
                            key={idx}
                            to={r.path}
                            onClick={() => setResults([])}
                            className="block px-2 py-1 hover:bg-indigo-500 hover:text-white"
                        >
                            {r.type}: {r.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
