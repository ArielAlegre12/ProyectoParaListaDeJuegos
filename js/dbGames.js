import { supabase } from "./supabaseService,js";

export async function guardarJuegoEnDB(juego){
    const{data: userData} = await supabase.auth.getUser();
    
    if(!userData?.user){
        const guest = JSON.parse(localStorage.getItem("guest_games") || "[]");
        const existe = guest.some(g=>g.id === juego.id);

        if(!existe){
            guest.push(juego);
            localStorage.setItem("guest_games", JSON.stringify(guest)); 
        }
        return;
    }
    const{error} = await supabase
        .from("games")
        .insert([{
            catalogo_id: juego.id,
            estado: juego.estado,
            user_id: userData.user.id
        }]);
}