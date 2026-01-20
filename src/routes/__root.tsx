import { HeadContent, Outlet, Scripts, createRootRoute, useMatch } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'
import { RouterProgress } from '../components/router-progress'
import { Toaster } from 'sonner'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AKSIS - SMAN 1 BANTARUJEG',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
        <Toaster closeButton richColors position="top-right" />
      </body>
    </html>
  )
}

function RootLayout() {
  const isIndexPage = useMatch({ from: '/', shouldThrow: false })
  const isLoginPage = useMatch({ from: '/login', shouldThrow: false })
  const isDashboard = useMatch({ from: '/dashboard', shouldThrow: false })

  const hideHeader = isIndexPage || isLoginPage || isDashboard

  return (
    <>
      <RouterProgress />
      {!hideHeader && <Header />}
      <Outlet />
    </>
  )
}
