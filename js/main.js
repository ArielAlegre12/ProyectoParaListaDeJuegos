document.addEventListener('DOMContentLoaded', function () {
    //seleciono el formulario
    const botonBuscador = document.querySelector('#miFormu');//id del boton
    const entradaJuego = document.querySelector('#entradaJuego');
    const divJuegos = document.getElementById("listGames");
    const resultadoBusqueda = document.getElementById("resultadosBusqueda");
    const mensajeModal = document.getElementById("mensajeModal");
    const mensajeForm = document.getElementById("mensajeForm");
    const footer = document.querySelector("footer");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const btnLogin = document.getElementById("btnLogin");
    const btnRegister = document.getElementById("btnRegister");
    const loginMessage = document.getElementById("loginMessage");
    const togglePassword = document.getElementById("togglePassword");
    const loginPasswordInput = document.getElementById("loginPassword");
    const icon = togglePassword.querySelector("i");
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
    const supabaseUrl = "https://ecbqcrvoigykjpemgeps.supabase.co";
    const supabaseKey = "sb_publishable_mbXh1ZGw04vJfisrJlbKYQ_1LdzYvcH";

    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    //función para supabase
    async function guardarJuegoEnDB(juego) {
        const user = supabase.auth.getUser();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
            mostrarMensajeLogin("No hay usuario logueado");
            return;
        }

        const { data, error } = await supabase
            .from('games')
            .insert([{
                nombre: juego.nombre,
                anio: juego.anio,
                imagen: juego.imagen,
                estado: juego.estado || "Pendiente",
                user_id: userData.user.id
            }]);

        if (error) {
            console.log("Error al guardar juego:", error);
        } else {
            console.log("Juego guardado en DB:", data);
        }
    }
    //cargar desde DB
    async function cargarDesdeBD() {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) return;

        const { data, error } = await supabase
            .from('games')
            .select('*')
            .eq('user_id', userData.user.id);

        if (error) {
            console.log("error al cargar DB:", error);
        } else if (data) {
            data.forEach(juegoDB => {
                if(!listaJuegos.some(j=>j.nombre.toLowerCase() === juegoDB.nombre.toLowerCase())){
                    listaJuegos.push({
                        nombre: juegoDB.nombre,
                        anio: juegoDB.anio,
                        imagen: juegoDB.imagen,
                        estado: juegoDB.estado || "Pendiente"
                    });
                }

                if(!catalogoJuegos.some(j=>j.nombre.toLowerCase() === juegoDB.nombre.toLowerCase())){
                    catalogoJuegos.push({
                        nombre: juegoDB.nombre,
                        anio: juegoDB.anio,
                        imagen: juegoDB.imagen
                    });
                }
            });
            mostrarLista();
        }
    }

    //mostrar o no password
    togglePassword.addEventListener("click", () => {
        if (loginPasswordInput.type === "password") {
            loginPasswordInput.type = "text";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
        } else {
            loginPasswordInput.type = "password";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
        }
    })

    //función para reinciar el titulo
    function reinciaAnimacion() {
        titulo.classList.remove("titulo-gamer");
        //forzar el reflow
        void titulo.offsetWidth;

        titulo.classList.add("titulo-gamer")
    }
    setInterval(reinciaAnimacion, 5000);//repite en bucle

    //función para evitar que la lupa de busqueda aplaste el footer jei
    window.addEventListener("scroll", function () {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (footerRect.top < windowHeight) {
            //está tocando el footer?si, subir la lupa
            btnBuscar.style.bottom = (windowHeight - footerRect.top + 20) + "px";
        } else {
            //pos. normal
            btnBuscar.style.bottom = "20px";
        }
    })

    //cerrar menu al hacer click afuera(para moviles)
    document.addEventListener('click', function (event) {
        const clickAdentro = navbar.contains(event.target);

        if (!clickAdentro && collapse.classList.contains('show')) {
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
            }, 300);
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
            }, 300);
        }, 1000);
    }
    function ocultarMensaje() {
        mensajeForm.style.display = "none";
    }

    //mostrar msj modal login
    function mostrarMensajeLogin(texto) {
        loginMessage.style.display = "block";
        loginMessage.textContent = texto;
        setTimeout(() => loginMessage.style.display = "none", 2000);
    }
    //registro
    btnRegister.addEventListener("click", async () => {
        btnRegister.disabled = true;
        const { data, error } = await supabase.auth.signUp({
            email: loginEmail.value,
            password: loginPassword.value
        });
        if (error) {
            mostrarMensajeLogin(error.message);
            if (error.status === 429) {
                mostrarMensajeLogin("Demasiados intentos. Esperá unos segundos.");
            }
        } else {
            mostrarMensajeLogin("Usuario creado! Revisa tu correo para confirmar.");
        }
        setTimeout(() => btnRegister.disabled = false, 52000);
    });

    //login
    btnLogin.addEventListener("click", async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail.value,
            password: loginPassword.value
        });
        if (error) {
            mostrarMensajeLogin(error.message);
        } else {
            mostrarMensajeLogin("Bienvenido!");
            console.log("usuario logueado: ", data.user);
            //acá se carga la lista de juegos del usuario
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
            modal.hide();//cierra el modal al ingresar
            mostrarMenuUsuario(data.user);
            
            //limpiar listas antes de cargar
            listaJuegos.length = 0;
            catalogoJuegos.length = 0;
            //cargar el catalogo + juegos guardados del usuario
            await cargarCatalogo();
            await cargarDesdeBD();
        }
    })

    //función para el menu de usuario
    function mostrarMenuUsuario(user) {
        const loginContainer = document.getElementById("navLogin");
        if (!loginContainer) return;
        loginContainer.innerHTML = `
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            ${user.email}
            </button>
            <ul class="dropdown-menu" aria-labelledby="userMenuButton">
                <li><button class="dropdown-item" id="btnLogout">Cerrar sesión</button></li>
            </ul>
        </div>
        `;

        document.getElementById("btnLogout").addEventListener("click", async () => {
            await supabase.auth.signOut();
            //limpiamos listas y DOM
            listaJuegos.length = 0;
            catalogoJuegos.length = 0;
            divJuegos.innerHTML = "";
            //restaurar login original
            loginContainer.innerHTML = `
            <li class="nav-item">
                <a href="#" class="nav-link active" data-bs-toggle="modal" data-bs-target="#modalLogin">Login</a>
            </li>
        `;
        });
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
        guardarJuegoEnDB({ nombre, anio, imagen});

        //agregamos al catálogo en caso de que no exista
        if (!catalogoJuegos.some(j => j.nombre.toLowerCase() === nombre.toLowerCase())) {
            const nuevoJuego = { nombre, anio, imagen };
            catalogoJuegos.push(nuevoJuego);

        }

        //cerramos el modal
        modalAgregarJuego.hide();
    });



    //agregar juegos a la lista
    function agregarJuegosALaLista(element) {
        if (!listaJuegos.some(j => j.nombre.toLowerCase() === element.nombre.toLowerCase())) {
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

            console.log(catalogoJuegos);
            catalogoJuegos.push(...catalogoBase);
        } catch (error) {
            console.log("Error al cargar el catálogo: ", error);
        }
    }
    async function init() {
        await cargarCatalogo();
        const { data, error } = await supabase.auth.getUser();
        if(error) return console.log("Error al obtener usuario:", error);
        const user = data.user;
        if (user) {
            mostrarMenuUsuario(user);
            await cargarCatalogo();
            console.log("Usuario al recargar:", user);
            await cargarDesdeBD();
        }
    }
    init();

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
                    mostrarMensaje("Este juego ya lo tenés en tu checkList!");
                }
            } else {
                mostrarMensaje("Juego no encontrado en el catálogo");
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
        listaJuegos.forEach(juego => actualizarEstadoJuegoEnDB(juego));
    }

    async function actualizarEstadoJuegoEnDB(juego) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) return;

        const { error } = await supabase
            .from('games')
            .update({ estado: juego.estado })
            .eq('user_id', userData.user.id)
            .eq('nombre', juego.nombre);

        if (error) console.log("error al actualizar estado:", error);
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

