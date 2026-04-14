const supabaseUrl = "https://ecbqcrvoigykjpemgeps.supabase.co";
const supabaseKey = "sb_publishable_mbXh1ZGw04vJfisrJlbKYQ_1LdzYvcH";
export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

//auth
export async function getUser(){
    const{data} = await supabase.auth.getUser();
    return data.user;
}

export async function login(email, password){
    return await supabase.auth.signInWithPassword({email, password});
}

export async function register(email, password){
    return await supabase.auth.signUp({email, password});
}

export async function logout(){
    return await supabase.auth.signOut();
}