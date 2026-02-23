import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { IMAGES } from '@/lib/constants';

export function AdminHeader({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={onMenuToggle}
        >
          <MaterialIcon name="menu" />
        </button>

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
          <MaterialIcon name="store" className="text-slate-500 text-[18px]" />
          <span className="text-sm font-semibold hidden sm:inline">Main Boutique Store</span>
          <span className="text-sm font-semibold sm:hidden">Store</span>
          <MaterialIcon name="expand_more" className="text-slate-400 text-[18px]" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
          <MaterialIcon name="notifications" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1" />
        <div className="flex items-center gap-3 pl-2">
          <div className="size-8 rounded-full overflow-hidden">
            <img src={IMAGES.userAvatar} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">Admin User</p>
            <p className="text-xs text-slate-400">Store Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
