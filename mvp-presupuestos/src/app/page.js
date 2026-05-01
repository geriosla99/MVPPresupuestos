"use client"

import Navbar from "../Components/Navbar"
import FormPresupuesto from "../Components/FormPresupuesto"

export default function Home(){

return(

<div className="container">

<Navbar/>

<div className="card">

<h1>Crear Presupuesto</h1>

<FormPresupuesto/>

</div>

</div>

)

}