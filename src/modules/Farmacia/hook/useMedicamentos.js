import { useEffect, useState } from "react";
import { getMedicamentos } from "../services/farmaciaService";

export const useMedicamentos = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getMedicamentos();
    setData(res);
  };

  return { data, reload: load };
};