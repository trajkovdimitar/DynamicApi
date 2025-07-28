import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { searchEntities } from '../services/search';
import { Input } from './common/Input';

interface SearchResult {
    type: 'model' | 'rule' | 'workflow';
    name: string;
    path: string;
}

const Wrapper = styled.div`
    position: relative;
`;

const Results = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    max-height: 16rem;
    overflow-y: auto;
    z-index: 30;
`;

const ResultItem = styled(Link)`
    display: block;
    padding: ${({ theme }) => theme.spacing.sm};
    text-decoration: none;
    color: inherit;
    &:hover {
        background: ${({ theme }) => theme.colors.primaryLight};
        color: #fff;
    }
`;

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
        <Wrapper ref={containerRef}>
            <Input
                placeholder="Search"
                value={q}
                onChange={e => setQ(e.target.value)}
                aria-label="Global search"
            />
            {results.length > 0 && (
                <Results>
                    {results.map((r, idx) => (
                        <ResultItem key={idx} to={r.path} onClick={() => setResults([])}>
                            {r.type}: {r.name}
                        </ResultItem>
                    ))}
                </Results>
            )}
        </Wrapper>
    );
}
