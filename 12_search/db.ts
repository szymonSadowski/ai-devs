import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.SUPABASE_URL as string;
export const supabaseAnonKey = process.env.SUPABASE_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const main = async () => {
  const url = "https://unknow.news/archiwum_aidevs.json";
  const response = await fetch(url);
  const records = await response.json();
  console.log(records);
  const { error } = await supabase.from("news").insert(records);
  console.log(error);
};

main();
