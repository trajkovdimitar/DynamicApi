import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const StyledSkeleton = styled.div<{height?:string}>`
  background: #e1e1e1;
  background-image: linear-gradient(90deg, #e1e1e1 0px, #f2f2f2 40px, #e1e1e1 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => theme.radius};
  height: ${({height}) => height ?? '1rem'};
  animation: ${shimmer} 1.2s infinite linear;
`;

export default function Skeleton({ height }: { height?: string }) {
  return <StyledSkeleton height={height} />;
}
