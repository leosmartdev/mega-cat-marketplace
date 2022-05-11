/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/dashboard'
  },
  {
    id: 'product',
    title: 'Product',
    type: 'collapsable',
    icon: 'heroicons_outline:pencil-alt',
    children: [
      {
        id: 'product.list',
        title: 'Product List',
        type: 'basic',
        link: '/list-product'
      },
      {
        id: 'product.create',
        title: 'Create Product',
        type: 'basic',
        link: '/create-product'
      }
    ]
  },
  {
    id: 'roles',
    title: 'Roles',
    type: 'collapsable',
    icon: 'heroicons_outline:pencil-alt',
    children: [
      {
        id: 'roles.list',
        title: 'Admins',
        type: 'basic',
        link: '/list-admins'
      },
      {
        id: 'roles.create',
        title: 'Assign Admin Role',
        type: 'basic',
        link: '/create-admin'
      }
    ]
  },
  {
    id: 'payouts',
    title: 'Payouts',
    type: 'basic',
    icon: 'heroicons_outline:pencil-alt',
    link: '/pending-payouts',
    children: [
      {
        id: 'payouts.pending',
        title: 'Payouts',
        type: 'basic',
        link: '/pending-payouts'
      }
    ]
  },
  {
    id: 'admin-purchase-history',
    title: 'Purchase History',
    type: 'basic',
    icon: 'heroicons_outline:pencil-alt',
    link: '/admin-purchase-history'
  },
  {
    id: 'blockchain',
    title: 'Blockchain',
    type: 'collapsable',
    icon: 'heroicons_outline:cube',
    children: [
      {
        id: 'blockchain.deploy',
        title: 'Smart Contracts',
        type: 'basic',
        link: '/blockchain/deploy'
      }
    ]
  }
];
export const compactNavigation: FuseNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/dashboard'
  }
];
export const futuristicNavigation: FuseNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/dashboard'
  }
];
export const horizontalNavigation: FuseNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Example',
    type: 'basic',
    icon: 'heroicons_outline:chart-pie',
    link: '/dashboard'
  }
];
