import './globals.css'

export const metadata = {
  title: 'Brevet Booster — Plateforme de révision maths',
  description: 'Prépare ton brevet de maths avec Brevet Booster',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
