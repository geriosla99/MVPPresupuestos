"use client"

import Link from "next/link"

export default function Navbar(){

return(

<nav className="navbar">

<h2>MVP Presupuesto</h2>

<div className="navLinks">

<Link href="/">Inicio</Link>

<Link href="/dashboard">Dashboard</Link>

</div>

</nav>

)

}