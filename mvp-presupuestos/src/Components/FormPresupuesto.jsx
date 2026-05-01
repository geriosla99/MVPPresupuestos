"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/*
Este formulario crea el presupuesto inicial

Se guarda:
- nombre del presupuesto
- meta de ahorro
*/

export default function FormPresupuesto(){

const [nombre,setNombre] = useState("")
const [meta,setMeta] = useState("")

const router = useRouter()

const guardar = ()=>{

const data = {
nombre,
metaAhorro: Number(meta),
ingresos:[],
gastos:[],
seguimiento:[]
}

localStorage.setItem("presupuesto",JSON.stringify(data))

router.push("/dashboard")
}

return(

<div>

<input
placeholder="Nombre del presupuesto"
value={nombre}
onChange={(e)=>setNombre(e.target.value)}
/>

<input
type="number"
placeholder="Meta de ahorro mensual"
value={meta}
onChange={(e)=>setMeta(e.target.value)}
/>

<button onClick={guardar}>
Crear presupuesto
</button>

</div>

)
}