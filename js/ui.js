export function mostrarMensaje(elemento, texto, timeoutRef){
    elemento.textContent = texto;
    elemento.style.display = "block";
    elemento.style.opacity = "1";

    clearTimeout(timeoutRef.value);

    timeoutRef.value = setTimeout(()=>{
        elemento.style.opacity = "0";
        setTimeout(()=>{
            elemento.style.display = "none";
        },300);
    }, 1000);
}

export function mostrarLoading(el){
    el;
}