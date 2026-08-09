import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oxtzqztealgamvrgbnyb.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_Wcq6i1Ozk9Tpv52kQoC-Hw_j_B7J2Pw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);