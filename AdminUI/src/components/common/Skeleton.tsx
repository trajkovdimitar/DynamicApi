interface Props {
    height?: string;
}

export default function Skeleton({ height = '1rem' }: Props) {
    return (
        <div
            className="animate-pulse rounded bg-gray-200"
            style={{ height }}
        />
    );
}
