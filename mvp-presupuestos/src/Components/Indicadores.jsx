"use client";

import { useEffect,useState } from "react";

/*
Calcula indicadores financieros

- ingresos totales
- gastos totales
- balance
*/

export default function Indicadores(){

const [data,setData] = useState(null)

useEffect(()=>{

const stored = JSON.parse(localStorage.getItem("presupuesto"))

setData(stored)

},[])

if(!data) return null

const totalIngresos =
data.ingresos.reduce((a,b)=>a+b.valor,0)

const totalGastos =
data.gastos.reduce((a,b)=>a+b.valor,0)

const balance = totalIngresos - totalGastos

return(

<div>

<h2>{data.nombre}</h2>

<p>Ingresos: ${totalIngresos}</p>

<p>Gastos: ${totalGastos}</p>

<p>Balance: ${balance}</p>

{balance < 0 &&

<div className="alerta">
⚠ Estás gastando más de lo que ingresas
</div>

}

</div>

)
}