import { supabase } from "@/supabaseClient.js";

const CIE_TABLE = "cie10";

function warnIfSupabaseSchemaIssue(error) {
  const message = (error?.message || "").toLowerCase();

  if (
    message.includes('relation "cie10" does not exist') ||
    message.includes("could not find the table")
  ) {
    console.warn(
      `[CIE10] La tabla "${CIE_TABLE}" no existe o no es accesible en este schema.`
    );
  }

  if (message.includes("column") && message.includes("does not exist")) {
    console.warn(
      '[CIE10] Verifica nombres de columnas. Se espera: "code" y "description".'
    );
  }

  if (
    error?.code === "42501" ||
    message.includes("row-level security") ||
    message.includes("permission denied")
  ) {
    console.warn(
      `[CIE10] SELECT bloqueado por RLS/permisos. Revisa policy de lectura para "${CIE_TABLE}".`
    );
  }
}

export const searchCIE = async (query) => {
  const normalizedQuery = (query || "").trim();

  console.log("Query:", normalizedQuery);

  if (!normalizedQuery) {
    return [];
  }

  const escaped = normalizedQuery
    .replace(/,/g, "\\,")
    .replace(/\*/g, "");
  const pattern = `*${escaped}*`;

  try {
    const { data, error } = await supabase
      .from(CIE_TABLE)
      .select("code, description")
      .or(`code.ilike.${pattern},description.ilike.${pattern}`)
      .order("code", { ascending: true })
      .limit(10);

    console.log("Resultados Supabase:", data);

    if (error) {
      console.error("Error searching CIE-10:", error);
      warnIfSupabaseSchemaIssue(error);
      return [];
    }

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter((item) => item && item.code)
      .map((item) => ({
        code: item.code,
        description: item.description || "",
      }));
  } catch (error) {
    console.error("Unexpected error searching CIE-10:", error);
    warnIfSupabaseSchemaIssue(error);
    return [];
  }
};
