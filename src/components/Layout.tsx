import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../utils/cn';
import { TABS } from '../config/tabs';

export const Layout = () => {
  return (
    <div className="min-h-screen font-sans flex flex-col">
      <header className="sticky top-0 z-20 h-14 flex items-center px-6 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/60 shrink-0">
        <NavLink
          to="/"
          className="text-base font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors"
        >
          $ HQ
        </NavLink>
        <nav className="ml-auto flex items-center gap-5 overflow-x-auto">
          {TABS.map(({ id, path, label }) => (
            <NavLink
              key={id}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                cn(
                  'text-sm transition-colors whitespace-nowrap',
                  isActive ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <span className="text-zinc-700 select-none" aria-hidden="true">|</span>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              cn(
                'text-sm transition-colors whitespace-nowrap',
                isActive ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              )
            }
          >
            About
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-zinc-600 text-xs font-medium shrink-0">
        Made with &lt;3 in KL by @Hazriq
      </footer>
    </div>
  );
};
