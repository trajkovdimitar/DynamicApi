import { Link } from 'react-router-dom';

interface Item {
    label: string;
    href?: string;
}


export function Breadcrumb({ items }: { items: Item[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-2 text-sm">
            <ol className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <li key={idx}>
                        {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
                        {idx < items.length - 1 && ' / '}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
