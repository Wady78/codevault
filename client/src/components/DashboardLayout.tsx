import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Bookmark, Code2, FolderCode, LayoutDashboard, LogOut, PanelLeft, Star } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "All snippets", path: "/" },
  { icon: Star, label: "Favorites", path: "/?view=favorites" },
  { icon: FolderCode, label: "Collections", path: "/?view=collections" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || 272);
  const { loading, user } = useAuth();
  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()), [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-6"><div className="w-full max-w-md rounded-3xl border border-[#e6e9ee] bg-white p-10 text-center shadow-[0_20px_60px_rgba(28,36,52,0.08)]"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1b2b45] text-white"><Code2 className="h-7 w-7" /></div><p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#7c8798]">MY CODE VAULT</p><h1 className="mb-3 text-3xl font-semibold tracking-tight text-[#182236]">Your code, in its place.</h1><p className="mb-8 text-sm leading-6 text-[#738094]">Sign in to save, organize, and reuse your most valuable snippets across devices.</p><Button onClick={() => startLogin()} size="lg" className="w-full rounded-xl bg-[#1b2b45] hover:bg-[#263b5b]">Sign in securely</Button></div></div>;
  }

  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardContent setSidebarWidth={setSidebarWidth}>{children}</DashboardContent></SidebarProvider>;
}

function DashboardContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (width: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const active = menuItems.find(item => item.path === location) ?? menuItems[0];

  useEffect(() => {
    const move = (event: MouseEvent) => { if (isResizing && sidebarRef.current) { const width = event.clientX - sidebarRef.current.getBoundingClientRect().left; if (width >= 220 && width <= 420) setSidebarWidth(width); } };
    const up = () => setIsResizing(false);
    if (isResizing) { document.addEventListener("mousemove", move); document.addEventListener("mouseup", up); document.body.style.cursor = "col-resize"; }
    return () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); document.body.style.cursor = ""; };
  }, [isResizing, setSidebarWidth]);

  return <><div ref={sidebarRef} className="relative"><Sidebar collapsible="icon" className="border-r border-[#e6e9ee] bg-[#fbfcfd]"><SidebarHeader className="h-20 justify-center border-b border-[#edf0f4] px-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1b2b45] text-white shadow-sm"><Code2 className="h-4 w-4" /></div>{!isCollapsed && <div className="min-w-0"><p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#8b95a5]">MY CODE</p><p className="text-sm font-semibold tracking-tight text-[#1b2b45]">VAULT</p></div>}<button onClick={toggleSidebar} aria-label="Toggle navigation" className="ml-auto rounded-lg p-2 text-[#8b95a5] hover:bg-[#eef1f5] focus-visible:ring-2 focus-visible:ring-[#b6c7e2]"><PanelLeft className="h-4 w-4" /></button></div></SidebarHeader><SidebarContent className="px-3 py-5"><p className="mb-3 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#a0a9b8] group-data-[collapsible=icon]:hidden">Workspace</p><SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl text-[#667286] data-[active=true]:bg-[#e8eef8] data-[active=true]:font-semibold data-[active=true]:text-[#1b2b45]"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu><div className="mt-8 rounded-2xl bg-[#f0f4fa] p-4 group-data-[collapsible=icon]:hidden"><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#57739b]"><Bookmark className="h-4 w-4" /></div><p className="text-xs font-semibold text-[#344866]">A calm place for your best work.</p><p className="mt-1 text-[11px] leading-5 text-[#7c8ba1]">Save once. Find it when you need it.</p></div></SidebarContent><SidebarFooter className="border-t border-[#edf0f4] p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-[#eef1f5] focus-visible:ring-2 focus-visible:ring-[#b6c7e2] group-data-[collapsible=icon]:justify-center"><Avatar className="h-9 w-9 border border-[#dbe2ec]"><AvatarFallback className="bg-[#e8eef8] text-xs font-semibold text-[#365477]">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-semibold text-[#354258]">{user?.name || "Your account"}</p><p className="mt-1 truncate text-[11px] text-[#8994a5]">{user?.email || "Signed in"}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><div className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#dce6f5] ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} /></div><SidebarInset className="bg-[#f7f8fa]">{isMobile && <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[#e6e9ee] bg-[#f7f8fa]/90 px-4 backdrop-blur"><SidebarTrigger className="h-9 w-9 rounded-lg" /><span className="text-sm font-semibold text-[#27364e]">{active.label}</span></div>}<main className="min-h-screen px-4 py-5 sm:px-7 sm:py-8 lg:px-10">{children}</main></SidebarInset></>;
}
