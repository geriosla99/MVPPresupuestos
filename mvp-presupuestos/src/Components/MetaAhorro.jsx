"use client";

import { useEffect,useState } from "react";

/*
Seguimiento mensual del ahorro
*/

export default function MetaAhorro(){

const [data,setData] = useState(null)
const [mes,setMes] = useState("")
const [valor,setValor] = useState("")

useEffect(()=>{

const stored = JSON.parse(localStorage.getItem("presupuesto"))

setData(stored)

},[])

const registrar = ()=>{

const nuevo = {...data}

nuevo.seguimiento.push({
mes,
valor:Number(valor)
})

localStorage.setItem("presupuesto",JSON.stringify(nuevo))

setData(nuevo)

}

if(!data) return null

return(

<div>

<h2>Meta de ahorro mensual</h2>

<p>Meta: ${data.metaAhorro}</p>

<input
placeholder="Mes"
onChange={(e)=>setMes(e.target.value)}
/>

<input
type="number"
placeholder="Ahorro logrado"
onChange={(e)=>setValor(e.target.value)}
/>

<button onClick={registrar}>
Registrar ahorro
</button>

<ul>

{data.seguimiento.map((s,i)=>{

const logro = s.valor >= data.metaAhorro

return(

<li key={i}>

{s.mes} - ${s.valor}

{logro
? " ✅ Meta cumplida"
: " ❌ Meta no alcanzada"
}

</li>

)

})}

</ul>

</div>

)
}