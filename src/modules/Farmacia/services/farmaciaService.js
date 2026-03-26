import { supabase } from "@/lib/supabaseClient.js";

export const getMedicamentos = async () => {
  const { data, error } = await supabase
    .from("medicamentos")
    .select("*");

  if (error) throw error;
  return data;
};

export const addMedicamento = async (med) => {
  const { error } = await supabase
    .from("medicamentos")
    .insert([med]);

  if (error) throw error;
};