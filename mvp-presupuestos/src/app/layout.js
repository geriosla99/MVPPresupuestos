import "../styles/global.css"

export const metadata = {
 title: "MVP Presupuestos"
}

export default function RootLayout({ children }) {
 return (
  <html lang="es">
   <body>
    {children}
   </body>
  </html>
 )
}