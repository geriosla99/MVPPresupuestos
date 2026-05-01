"use client";

import { useState,useEffect } from "react";

/*
Permite registrar ingresos y gastos
*/

export default function RegistroFinanzas(){

const [data,setData] = useState(null)

const [nombre,setNombre] = useState("")
const [valor,setValor] = useState("")
const [tipo,setTipo] = useState("gasto")

useEffect(()=>{

const stored = JSON.parse(localStorage.getItem("presupuesto"))

setData(stored)

},[])


const agregar = ()=>{

if(!nombre || !valor) return

const nuevo = {...data}

if(tipo==="gasto"){
nuevo.gastos.push({nombre,valor:Number(valor)})
}else{
nuevo.ingresos.push({nombre,valor:Number(valor)})
}

localStorage.setItem("presupuesto",JSON.stringify(nuevo))

setData(nuevo)

setNombre("")
setValor("")

}

if(!data) return null

return(

<div>

<h2>Registrar movimiento</h2>

<select onChange={(e)=>setTipo(e.target.value)}>

<option value="gasto">Gasto</option>
<option value="ingreso">Ingreso</option>

</select>

<input
placeholder="Nombre"
value={nombre}
onChange={(e)=>setNombre(e.target.value)}
/>

<input
type="number"
placeholder="Valor"
value={valor}
onChange={(e)=>setValor(e.target.value)}
/>

<button onClick={agregar}>
Agregar
</button>

</div>

)
}