document.addEventListener('DOMContentLoaded', function () {
    //seleciono el formulario
    const botonBuscador = document.querySelector('#miFormu');//id del boton
    const entradaJuego = document.querySelector('#entradaJuego');
    const divJuegos = document.getElementById("listGames");
    const resultadoBusqueda = document.getElementById("resultadosBusqueda");
    const mensajeModal = document.getElementById("mensajeModal");
    const mensajeForm = document.getElementById("mensajeForm");
    let timeoutForm;
    let timeoutModal;
    const listaJuegos = [];
    let catalogoJuegos = [];
    let indiceSeleccionado = -1;
    //modal y sus campos
    const modalAgregarJuego = new bootstrap.Modal(document.getElementById('modalAgregarJuego'));
    const nombreManual = document.getElementById('nombreManual');
    const anioManual = document.getElementById('anioManual');
    const imagenManual = document.getElementById('imagenManual');
    const btnGuardarManual = document.getElementById('guardarManual');
    const btnAgregarManual = document.getElementById('btnAgregarManual');
    const btnBuscar = document.getElementById("btnBuscar");
    const input = document.getElementById("entradaJuego");
    const titulo = document.getElementById("titulo");
    const navbar = document.querySelector('.navbar');
    const collapse = document.getElementById("navbarSupportedContent");
    

    //función para reinciar el titulo
    function reinciaAnimacion(){
        titulo.classList.remove("titulo-gamer");
        //forzar el reflow
        void titulo.offsetWidth;

        titulo.classList.add("titulo-gamer")
    }
    setInterval(reinciaAnimacion, 5000);//repite en bucle

    //función para evitar que la lupa de busqueda aplaste el footer jei
    window.addEventListener("scroll", function(){
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if(footerRect.top < windowHeight){
            //está tocando el footer?si, subir la lupa
            btnBuscar.style.bottom = (windowHeight - footerRect.top + 20) + "px";
        }else{
            //pos. normal
            btnBuscar.style.bottom = "20px";
        }
    })

    //cerrar menu al hacer click afuera(para moviles)
    document.addEventListener('click', function(event){
        const clickAdentro = navbar.contains(event.target);

        if(!clickAdentro  && collapse.classList.contains('show')){
            const bsCollapse = new bootstrap.Collapse(collapse, {
                toggle: false
            });
            bsCollapse.hide();
        }
    });

    //funciones helper para agregar manualmente
    function mostrarMensajeModal(texto) {
        mensajeModal.textContent = texto;
        mensajeModal.style.display = "block";

        //reset
        mensajeModal.style.opacity = "1";
        mensajeModal.style.transition = "opacity 0.3s";

        clearTimeout(timeoutModal);

        timeoutModal = setTimeout(() => {
            mensajeModal.style.opacity = "0";

            setTimeout(() => {
                mensajeModal.style.display = "none";
            }, 110);
        }, 1000);
    }
    function ocultarMensajeModal() {
        mensajeModal.style.display = "none";
    }

    function mostrarMensaje(texto) {
        mensajeForm.textContent = texto;
        mensajeForm.style.display = "block";

        //reset por si ya tenia animación
        mensajeForm.style.opacity = "1";
        mensajeForm.style.transition = "opacity 0.3s";

        clearTimeout(timeoutForm);

        timeoutForm = setTimeout(() => {
            mensajeForm.style.opacity = "0";

            //termina el fade y lo ocultamos
            setTimeout(() => {
                mensajeForm.style.display = "none";
            }, 110);
        }, 1000);
    }
    function ocultarMensaje() {
        mensajeForm.style.display = "none";
    }

    //abrir el modal al hacer click
    btnAgregarManual.addEventListener('click', function () {
        //limpio los campos
        nombreManual.value = '';
        anioManual.value = '';
        imagenManual.value = '';
        ocultarMensajeModal();
        modalAgregarJuego.show();
    });

    //btn que guarda el juego manualmente
    btnGuardarManual.addEventListener('click', function () {
        const nombre = nombreManual.value.trim();
        const anio = parseInt(anioManual.value);
        const imagen = imagenManual.value.trim();

        if (!nombre || !anio || !imagen) {
            mostrarMensajeModal("Completa todos los campos");
            return;
        }
        //chequea si ya existe la lista
        if (listaJuegos.some(j => j.nombre.toLowerCase() == nombre.toLowerCase())) {
            mostrarMensajeModal("Este juego ya está en tu lista!");
            return;
        }
        //agregamos a la lista
        agregarJuegosALaLista({ nombre, anio, imagen });

        //agregamos al catálogo en caso de que no exista
        if (!catalogoJuegos.some(j => j.nombre.toLowerCase() === nombre.toLowerCase())) {
            const nuevoJuego = { nombre, anio, imagen };
            catalogoJuegos.push(nuevoJuego);

            //guardar en el localStorage(solo los manuales)
            const catalogoGuardado = JSON.parse(localStorage.getItem("catalogoJuegos")) || [];
            catalogoGuardado.push(nuevoJuego);
            localStorage.setItem("catalogoJuegos", JSON.stringify(catalogoGuardado));
        }

        //cerramos el modal
        modalAgregarJuego.hide();
    });

    //intentar cargar lista guardad en localStorage
    const juegosGuardados = localStorage.getItem("misJuegos");
    if (juegosGuardados) {
        listaJuegos.push(...JSON.parse(juegosGuardados));
        mostrarLista();
    }

    //agregar juegos a la lista
    function agregarJuegosALaLista(element) {
        if (!listaJuegos.some(j => j.nombre === element.nombre)) {
            listaJuegos.push({ nombre: element.nombre, imagen: element.imagen, anio: element.anio, estado: "Pendiente" });
            mostrarLista();
        }
        entradaJuego.value = "";
        resultadoBusqueda.innerHTML = "";
        indiceSeleccionado = -1;
    }

    //el listener para moverse con teclas
    entradaJuego.addEventListener("keydown", function (e) {
        const resultados = resultadoBusqueda.querySelectorAll(".resultado");
        if (resultados.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            indiceSeleccionado = (indiceSeleccionado + 1) % resultados.length;
            actualizarResaltado(resultados);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            indiceSeleccionado = (indiceSeleccionado - 1 + resultados.length) % resultados.length;
            actualizarResaltado(resultados);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (indiceSeleccionado >= 0 && resultados[indiceSeleccionado]) {
                const nombre = resultados[indiceSeleccionado].textContent;
                const juego = catalogoJuegos.find(j => j.nombre === nombre);
                if (juego) {
                    if (listaJuegos.some(j => j.nombre.toLowerCase() === juego.nombre.toLowerCase())) {
                        mostrarMensaje("Este juego ya está en tu lista!");
                        return;
                    }
                    agregarJuegosALaLista(juego);
                    ocultarMensaje();
                }
            }
        }
    });
    //actualizar el resaltado visual 
    function actualizarResaltado(resultados) {
        resultados.forEach((div, i) => {
            if (i === indiceSeleccionado) {
                div.classList.add("resaltado");
                div.scrollIntoView({ block: "nearest" });
            } else {
                div.classList.remove("resaltado");
            }
        });
    }


    //sugerencias de busqueda
    entradaJuego.addEventListener('input', function () {
        const texto = entradaJuego.value.trim().toLowerCase();
        resultadoBusqueda.innerHTML = "";//para limpiar anteriores resultados.
        indiceSeleccionado = -1;

        if (texto === "") return;//si no hay nada escrito, no mostramos sugerencias.

        const coincidencias = catalogoJuegos.filter(j => j.nombre.toLowerCase().includes(texto));
        coincidencias.forEach(element => {
            const divResultado = document.createElement("div");
            divResultado.textContent = element.nombre;
            divResultado.classList.add("resultado");

            divResultado.addEventListener('click', function () {
                if (listaJuegos.some(j => j.nombre.toLowerCase() === element.nombre.toLowerCase())) {
                    mostrarMensaje("Este juego ya está en tu lista!");
                    return;
                }
                agregarJuegosALaLista(element);
                ocultarMensajeModal();
            });
            resultadoBusqueda.appendChild(divResultado);
        });
    });


    async function cargarCatalogo() {
        try {
            const respuesta = await fetch('data/catalogo.json');
            const catalogoBase = await respuesta.json();

            //cargar los juegos manuales guardados
            const catalogoGuardado = JSON.parse(localStorage.getItem("catalogoJuegos")) || [];

            //unir ambos catálogos
            catalogoJuegos = [...catalogoBase];
            catalogoGuardado.forEach(juegoManual => {
                const existe = catalogoJuegos.some(j =>
                    j.nombre.toLowerCase() === juegoManual.nombre.toLowerCase()
                );
                if (!existe) {
                    catalogoJuegos.push(juegoManual);
                }
            });

            console.log(catalogoJuegos);
        } catch (error) {
            console.log("Error al cargar el catálogo: ", error);
        }
    }
    cargarCatalogo();

    //escuchar el boton del formu.
    botonBuscador.addEventListener('submit', function (event) {
        event.preventDefault();
        resultadoBusqueda.innerHTML = "";
        const nombreJuego = entradaJuego.value.trim();
        //vemos que haya ingresado algo
        if (nombreJuego != "") {
            const resultado = catalogoJuegos.find(j => j.nombre.toLowerCase() === nombreJuego.toLowerCase());
            if (resultado) {
                //verifico que aún no este en la lista
                const yaEstaEnLista = listaJuegos.some(j => j.nombre.toLowerCase() == resultado.nombre.toLowerCase());
                if (!yaEstaEnLista) {
                    //agrega el checkList
                    listaJuegos.push({ nombre: resultado.nombre, anio: resultado.anio, imagen: resultado.imagen, estado: "Pendiente" });
                    mostrarLista();
                } else if (yaEstaEnLista) {
                    alert("Este juego ya lo tenés en tu checkList!");
                }
            } else {
                alert("Juego no encontrado en el catálogo");
            }
        }
        entradaJuego.value = "";
    });

    //función para mostrar la lista
    function mostrarLista() {
        divJuegos.innerHTML = "";

        listaJuegos.forEach((element, index) => {
            //columna
            const col = document.createElement("div");
            col.classList.add("col-12", "col-md-4", "col-lg-3");

            //card
            const card = document.createElement("div");
            card.classList.add("card", "h-100", "bg-dark", "text-light");

            //img
            const imgJuego = document.createElement("img");
            imgJuego.src = element.imagen;
            //si la img falla, ponemos una por defecto
            imgJuego.onerror = () => {
                imgJuego.onerror = null;//para evitar un loop infinito según el chat gpt 
                imgJuego.src = "assets/img/default.png";
            };
            imgJuego.alt = element.nombre;
            imgJuego.classList.add("card-img-top");

            //body
            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body", "d-flex", "flex-column");

            const titulo = document.createElement("h5");
            titulo.classList.add("card-title");
            titulo.textContent = element.nombre;

            const texto = document.createElement("p");
            texto.classList.add("card-text");
            texto.textContent = `Año: ${element.anio} | Estado: ${element.estado}`;

            //botones
            const btnCambiarEstado = document.createElement("button");
            btnCambiarEstado.textContent = "Cambiar Estado";
            btnCambiarEstado.classList.add("btn", "btn-warning", "me-2");

            const btnEliminarJuego = document.createElement("button");
            btnEliminarJuego.textContent = "Eliminar Juego";
            btnEliminarJuego.classList.add("btn", "btn-danger", "mt-auto");

            //eventos
            btnEliminarJuego.addEventListener('click', function () {
                listaJuegos.splice(index, 1);
                mostrarLista();
                if (listaJuegos.length == 0) {
                    localStorage.removeItem("misJuegos");
                }
            });

            btnCambiarEstado.addEventListener('click', function () {
                if (element.estado == "Pendiente") {
                    element.estado = "Completado";
                } else if (element.estado == "Completado") {
                    element.estado = "En proceso";
                } else {
                    element.estado = "Pendiente"
                }
                mostrarLista();
            })

            //el armado
            cardBody.append(titulo, texto, btnCambiarEstado, btnEliminarJuego);
            card.append(imgJuego, cardBody);
            col.appendChild(card);
            divJuegos.appendChild(col);

        });
        localStorage.setItem("misJuegos", JSON.stringify(listaJuegos));
    }


    //scrollear al buscador
    btnBuscar.addEventListener("click", function () {
        input.scrollIntoView({ behavior: "smooth" });
        input.focus();
    });
    //hacer que aparezca sólo al scrollear
    window.addEventListener("scroll", function () {
        if (window.scrollY > 200) {
            btnBuscar.style.display = "block";
        } else {
            btnBuscar.style.display = "none";
        }
    });

    //cerrar el nav al hacer click en alguna opcion
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        link.addEventListener('click', function () {
            const navbar = document.querySelector('.navbar-collapse');
            const bsCollapse = new bootstrap.Collapse(navbar, {
                toggle: false
            });
            bsCollapse.hide();
        });
    });

});

