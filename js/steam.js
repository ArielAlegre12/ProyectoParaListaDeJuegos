export async function buscarSteam(query) {
    const res = await fetch("https://ecbqcrvoigykjpemgeps.supabase.co/functions/v1/steam-search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": "sb_publishable_mbXh1ZGw04vJfisrJlbKYQ_1LdzYvcH",
            "Authorization": "Bearer sb_publishable_mbXh1ZGw04vJfisrJlbKYQ_1LdzYvcH"
        },
        body: JSON.stringify({ query })
    });

    return await res.json();
}