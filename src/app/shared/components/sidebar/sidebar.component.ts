import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

interface MenuItem {
  label: string;
  path?: string;
  expanded?: boolean;
  children?: MenuItem[];
  icon?: string;
  hasChildren?: boolean;
  description?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnChanges {
  @Input() isCollapsed: boolean = false;
  @Output() collapseSidebar = new EventEmitter<void>();

  public expanded: boolean = true;

  // Watch for changes to isCollapsed input
  ngOnChanges() {
    if (this.isCollapsed !== undefined) {
      this.expanded = !this.isCollapsed;
    }
  }
  activeItem: string = '/dashboard';
  openSubMenus: { [key: string]: boolean } = {};

  themeMode: 'light' | 'dark' = 'light';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeItem = event.urlAfterRedirects;
        // this.updateOpenSubMenus(this.activeItem);
        // Auto-collapse sidebar on navigation
        console.log('NavigationEnd detected, emitting collapseSidebar');
        this.collapseSidebar.emit();

      }
    });
  }

  menuItems: MenuItem[] = [
    {
      icon: 'fa-solid fa-tachometer-alt',
      label: 'Dashboard',
      path: '/dashboard',
      hasChildren: false,
      description: 'Main dashboard overview'
    },

    {
      icon: 'fa-solid fa-cogs',
      label: 'Masters',
      path: '/masters/ship-group/ship-master',
      hasChildren: false,
      description: 'Master data management'
    },
    {
      icon: 'fa-solid fa-anchor',
      label: 'SFD',
      path: '/sfd',
      hasChildren: false,
      description: 'Ship Fit Details'
    },

    // {
    //   icon: 'fa-solid fa-calendar',
    //   label: 'Maintop',
    //   path: '/maintop',
    //   hasChildren: false,
    //   description: 'Maintenance operations'
    // },
    // {
    //   icon: 'fa-solid fa-anchor',
    //   label: 'DART',
    //   path: '/dart',
    //   hasChildren: false,
    //   description: 'Data Analysis & Reports'
    // },
    {
      icon: 'fa-solid fa-chart-bar',
      label: 'SRAR',
      path: '/srar',
      hasChildren: false,
      description: 'Ship Running and Activity Return'
    },
    {
      icon: 'fa-solid fa-cog',
      label: 'Setup',
      path: '/setup',
      hasChildren: false,
    }
  ];

  ngOnInit() {
    console.log(this.getActiveRouteSegments());
  }
  // // This function will find the parent menu item and open its submenu
  // private updateOpenSubMenus(currentPath: string): void {
  //   this.openSubMenus = {};
  //   this.menuItems.forEach(item => {
  //     if (item.children) {
  //       const found = this.findPathInMenu(item.children, currentPath);
  //       if (found) {
  //         // Open the top-level parent and any nested parents
  //         const parentPaths = this.getParentPaths(item, currentPath);
  //         parentPaths.forEach(p => {
  //           this.openSubMenus[p] = true;
  //         });
  //       }
  //     }
  //   });
  // }
  
  // private findPathInMenu(menu: MenuItem[], path: string): boolean {
  //   for (const item of menu) {
  //     if (item.path === path) {
  //       return true;
  //     }
  //     if (item.children && this.findPathInMenu(item.children, path)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // private getParentPaths(root: MenuItem, childPath: string, paths: string[] = []): string[] {
  //   if (!root.children) return [];
  //   for (const child of root.children) {
  //     if (child.path === childPath) {
  //       if (root.path) {
  //         paths.push(root.path);
  //       }
  //       return paths;
  //     }
  //     if (child.children) {
  //       const result = this.getParentPaths(child, childPath, paths);
  //       if (result.length > 0) {
  //         if (child.path) {
  //           paths.unshift(child.path);
  //         }
  //         return paths;
  //       }
  //     }
  //   }
  //   return [];
  // }


  getActiveRouteSegments(): string[] {
    const currentUrl = this.router.url;
    // Remove leading slash and split by slash
    const segments = currentUrl.replace(/^\//, '').split('/').filter(segment => segment.length > 0);
    console.log('Current URL segments:', segments);
    return segments;
  }

  isActive(path: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === path || currentUrl.startsWith(path + '/');
  }
  toggleSidebar() {
    this.expanded = !this.expanded;
    if (!this.expanded) {
      this.openSubMenus = {};
    }
    console.log('toggleSidebar called, expanded:', this.expanded);
    // Emit to parent to sync the state
    this.collapseSidebar.emit();
  }

  toggleSubMenu(path: string): void {
    if (path) {
      this.openSubMenus[path] = !this.openSubMenus[path];
    }
  }

  navigateTo(path: string) {
    // this.setActiveItem(path);
    this.activeItem = path;
    console.log('navigateTo called with path:', path);
    this.router.navigate([path]);
    // Auto-collapse sidebar when navigating
    console.log('Emitting collapseSidebar from navigateTo');
    this.collapseSidebar.emit();
  }

  logOut() {
    localStorage.clear();
    // window.location.href = '/login';
    this.router.navigate(['/home']);
  }

  // getCurrentRoute(): string {
  //   return this.router.url;
  // }

  // buildRouteFromSegments(segments: string[]): string {
  //   return '/' + segments.join('/');
  // }

}