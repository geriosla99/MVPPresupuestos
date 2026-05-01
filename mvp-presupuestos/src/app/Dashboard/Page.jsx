"use client"

import Navbar from "../../Components/Navbar"
import Indicadores from "../../Components/Indicadores"
import RegistroFinanzas from "../../Components/RegistroFinanzas"
import MetaAhorro from "../../Components/MetaAhorro"

export default function Dashboard(){

return(

<div className="container">

<Navbar/>

<h1 className="titulo">Dashboard financiero</h1>

<Indicadores/>

<RegistroFinanzas/>

<MetaAhorro/>

</div>

)

}