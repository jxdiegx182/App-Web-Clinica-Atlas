import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from "recharts";

const COLORS = [
  "#FF5E5E", // EMERGENCIA
  "#00E5FF", // HOSPITAL DE DIA
  "#7BA6C2", // HOSPITALIZACION
  "#3F51B5", // UCI "#bff7ff"
  "#9575CD", // UCI PEDIATRICA"
  "#80CBC4"  // NEONATOLOGÍA
];

const ServicioPieChart = () => {
  const [data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "admisiones"),
      (snapshot) => {
        const contador = {
          EMERGENCIA: 0,
          "HOSPITAL DIA": 0,
          HOSPITALIZACION: 0,
          UCI: 0,
          "UCI PEDIATRICA": 0,
          NEONATOLOGÍA: 0,
        };
  
        snapshot.forEach((doc) => {
          const servicio = doc.data()?.mainData?.servicio;
          if (contador[servicio] !== undefined) {
            contador[servicio]++;
          }
        });
  
        const formattedData = Object.keys(contador).map((key) => ({
          name: key,
          value: contador[key],
        }));
  
        setData(formattedData);
      },
      (error) => {
        console.error("Error escuchando admisiones:", error);
      }
    );
  
    // 🔥 Limpieza al desmontar el componente
    return () => unsubscribe();
  }, []);
  


// Función para resaltar el segmento al pasar el mouse
  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);
  return (
    <div className="w-86 h-[142px] bg-[#eef4f7] rounded-xl ">
      

      <ResponsiveContainer width="100%" height="87%">
        <PieChart>
        <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={31} // Hace que sea un gráfico de DONA (más estético)
            outerRadius={60}
            paddingAngle={2} // Espacio entre segmentos
            cornerRadius={3} // Bordes redondeados en los segmentos
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            stroke="none"
            animationBegin={0}
            animationDuration={1500}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
              style={{
                filter: activeIndex === index ? `drop-shadow(0 0 9px ${COLORS[index]})` : 'none',
                transition: 'all 0.3s ease'
              }}
               />
            ))}
          </Pie>
          
          {/*<Legend />*/}
        </PieChart>
        
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-1">
        {data.map((entry, index) => (
          <div key={index} className=" flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
            <span className="text-[5px] text-gray-500 font-medium">{entry.name}</span>
          </div>
        ))}
      </div>
      {/* Mini Leyenda Personalizada */}
      
    </div>
  );
};

export default ServicioPieChart;
