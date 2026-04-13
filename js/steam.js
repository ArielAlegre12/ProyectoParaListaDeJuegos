export async function buscarSteam(query) {
    const res = await fetch("https://ecbqcrvoigykjpemgeps.supabase.co/functions/v1/steam-search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    });

    return await res.json();
}

export async function obtenerDetallesSteam(appid) {
    const res = await fetch("https://ecbqcrvoigykjpemgeps.supabase.co/functions/v1/steam-details", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ appid })
    });

    const data = await res.json();

    const game = data[appid];

    if (!game || !game.success) return null;

    const d = game.data;

    return {
        steam_id: appid,
        nombre: d.name,
        anio: d.release_date?.date
            ? new Date(d.release_date.date).getFullYear()
            : 0,
        imagen: d.header_image || d.screenshots?.[0]?.path_full
    };
}