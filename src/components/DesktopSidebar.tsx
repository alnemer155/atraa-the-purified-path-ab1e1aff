import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, BookText, Info, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BookAlt from './icons/BookAlt';
import { useQuranPause } from '@/lib/quran-paused';
import logoBlackAsset from '@/assets/brand/atraa-icon-black.png.asset.json';
import logoDarkAsset from '@/assets/brand/atraa-icon-dark.png.asset.json';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const DesktopSidebar = () => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { paused: quranPaused } = useQuranPause();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const primary = [
    { path: '/',         label: isAr ? 'الرئيسية'    : 'Home',     icon: Home },
    { path: '/library',  label: isAr ? 'المكتبة'    : 'Library',  icon: BookAlt },
    ...(quranPaused ? [] : [{ path: '/quran', label: isAr ? 'القرآن' : 'Quran', icon: BookText }]),
    { path: '/settings', label: isAr ? 'الإعدادات' : 'Settings', icon: Settings },
  ];

  const secondary = [
    { path: '/about',    label: isAr ? 'عن المنصة' : 'About',    icon: Info },
    { path: '/privacy',  label: isAr ? 'الخصوصية' : 'Privacy',  icon: Shield },
  ];

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" side={isAr ? 'right' : 'left'}>
      <SidebarHeader className="border-b border-border/30">
        <div className="flex items-center gap-2 px-2 py-3">
          <img src={logoBlackAsset.url} alt="عِتْرَة" className="w-8 h-8 rounded-lg flex-shrink-0 block dark:hidden" />
          <img src={logoDarkAsset.url} alt="عِتْرَة" className="w-8 h-8 rounded-lg flex-shrink-0 hidden dark:block" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[14px] text-foreground font-semibold leading-tight">عِتْرَة</p>
              <p className="text-[9px] text-muted-foreground leading-tight">Atraa Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>{isAr ? 'التنقل' : 'Navigation'}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                    <NavLink to={item.path} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>{isAr ? 'معلومات' : 'Information'}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                    <NavLink to={item.path} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <p className="px-2 py-1 text-[9px] text-muted-foreground/60 tabular-nums">
            v2.11.16 · 366
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DesktopSidebar;
