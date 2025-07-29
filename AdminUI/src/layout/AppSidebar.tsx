import { Link, useLocation } from 'react-router-dom';
import { TableIcon, PlugInIcon, ListIcon } from '../icons';
import { useSidebar } from '../context/SidebarContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Models', path: '/models', icon: <TableIcon /> },
  { name: 'Rules', path: '/rules', icon: <PlugInIcon /> },
  { name: 'Workflows', path: '/workflows', icon: <ListIcon /> },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? 'w-[290px]' : isHovered ? 'w-[290px]' : 'w-[90px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link to="/">
          <span className="text-xl font-semibold">AdminUI</span>
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? 'Menu' : ''}
          </h2>
          <ul className="flex flex-col gap-4">
            {navItems.map((nav) => (
              <li key={nav.name}>
                <Link
                  to={nav.path}
                  className={`menu-item group ${isActive(nav.path) ? 'menu-item-active' : 'menu-item-inactive'} ${
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
