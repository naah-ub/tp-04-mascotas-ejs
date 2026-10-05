# 🐾 Trabajo Práctico 04

## 🧐 ¿Qué es y cómo funciona esta aplicación?
Esta es una **aplicación web dinámica**. A diferencia de una página web estática (donde el contenido siempre es el mismo), un sitio dinámico procesa información en tiempo real. 

Cuando entrás al sitio, el servidor lee una lista de animales guardada en un archivo de datos, genera las pantallas con sus fotos y descripciones en el momento, y te permite usar un formulario para agregar nuevos registros de forma interactiva.

---

## 🛠️ Cómo instalar el proyecto y ponerlo en marcha

Para ejecutar este proyecto en tu computadora, necesitás tener instalado **Node.js**. Una vez que lo tengas listo, abrí una terminal de comandos en la carpeta del proyecto y seguí estos pasos:

1. **Instalar los módulos necesarios:** 
   Descargá las herramientas y librerías que hacen funcionar el código ejecutando:
   ```bash
   npm install
   ```
2. **Verificar la sintaxis:** 
   Revisá de forma automática que no haya errores de escritura o tipografía en los archivos clave:
   ```bash
   npm run check
   ```
3. **Encender el servidor:** 
   Poné en marcha el motor de la aplicación con el comando:
   ```bash
   npm start
   ```
   *Hecho esto, abrí tu navegador web de preferencia (Chrome, Firefox, Edge) e ingresá a la dirección `http://localhost:3000` para navegar por el sitio.*

---

## 🗺️ Mapa de navegación (Páginas y Rutas)
En el desarrollo de software, las "rutas" son las direcciones que el servidor interpreta para saber qué pantalla debe mostrarle al usuario. Esta aplicación maneja 5 rutas principales:
* `GET /` ➔ Te muestra la pantalla de inicio y bienvenida del sitio.
* `GET /mascotas` ➔ Carga el catálogo completo con todas las tarjetas de los animales.
* `GET /mascotas/nueva` ➔ Despliega el formulario para cargar un nuevo registro.
* `GET /mascotas/:id` ➔ Muestra la ficha individual de un animal específico usando su número identificador (ID). Por ejemplo: `/mascotas/2`.
* `POST /mascotas` ➔ Es una ruta invisible. Funciona como el "buzón" receptor donde el formulario envía los datos ingresados para que el servidor los evalúe.

---

## 🏗️ Guía de Arquitectura: ¿Cómo se diseñan las pantallas?

Para construir las páginas web combinamos código HTML tradicional con **EJS** (*Embedded JavaScript*), una herramienta que nos permite inyectar lógica de programación dentro del diseño visual. La interfaz se divide en tres piezas:

### 1. El Layout (El "Molde Global")
Es un archivo base (`main.ejs`) que contiene el esqueleto común a todo el sitio web: la configuración del idioma, los enlaces a los estilos visuales y la estructura principal. Tiene un espacio reservado llamado `<%- body %>` donde se va incrustando el contenido de cada página de manera automática.

### 2. Las Vistas (El "Contenido Particular")
Es el código exclusivo de cada sección. La vista del catálogo solo se preocupa por armar el listado de animales, mientras que la vista de inicio solo contiene el texto de bienvenida.

### 3. Los Parciales (Las "Piezas Reutilizables")
Son componentes visuales que se repiten en todo el sitio, como la barra de navegación superior (encabezado) y los derechos de autor inferiores (pie de página). Se escriben una sola vez y se incluyen en el molde global para evitar duplicar código.

## Estructura de vistas
El proyecto organiza la capa de presentación dentro del directorio `views/` implementando tres conceptos clave del motor EJS:
* **Layout (`layouts/main.ejs`)**: Es el molde global o esqueleto compartido que define la estructura HTML común, la codificación, metadatos y enlaces globales. Centraliza el diseño e inyecta dinámicamente las vistas específicas con la etiqueta `<%- body %>`.
* **Vista (ej: `inicio.ejs`, `lista.ejs`, `detalle.ejs`)**: Contiene exclusivamente los fragmentos de código HTML/EJS enfocados en el cuerpo de cada sección particular.
* **Parcial (`partials/encabezado.ejs` y `partials/pie.ejs`)**: Componentes reutilizables e independientes creados para no repetir código (como el menú de navegación superior y el pie de página) que se insertan de forma controlada en el layout mediante `<%- include() %>`.

### Los datos enviados a través de `res.render`
En Express, las vistas no pueden acceder directamente a la base de datos o a los archivos del servidor por sí solas. Para conectar la lógica del backend con la pantalla, utilizamos la función **`res.render("nombre_de_vista", { datos })`**. 

Esta función hace dos cosas fundamentales:
1. Localiza el archivo de la vista solicitada dentro de la carpeta correspondiente.
2. Le inyecta un paquete de datos en forma de objeto de JavaScript (por ejemplo, el título de la página o la lista de las mascotas). 

Al recibir este paquete, el motor EJS procesa las variables antes de enviar la página al navegador, permitiendo que el contenido cambie de forma dinámica para cada usuario.

> 🔒 **Buenas prácticas de seguridad (`=` vs `-`):** 
> Al mostrar datos que viajan mediante `res.render` (como el nombre o la especie de una mascota), usamos la etiqueta `<%= ... %>` con el signo **`=`**. Esto actúa como un filtro que transforma cualquier intento de código malicioso en texto plano inofensivo. En cambio, la etiqueta con guion `<%- ... %>` solo se utiliza para nuestras piezas de estructura interna (`body` e `includes`) porque le da permiso al navegador de interpretar el código HTML real.

---

## 📂 Procesamiento de datos y recursos del sistema

### Servir archivos estáticos (`express.static`)
Para que un sitio web cargue sus estilos de diseño, tipografías o imágenes locales (como el archivo `/css/estilos.css`), se requiere una función puente. El módulo `express.static` le indica al servidor qué carpeta tiene permitido entregar estos archivos directamente al navegador del usuario de forma segura y automatizada.

### Traducción de formularios (`express.urlencoded`)
Cuando alguien completa los campos del formulario y presiona enviar, los datos viajan por la red de una forma compacta y desordenada. La función `express.urlencoded` opera como un traductor: procesa ese paquete de red y lo convierte en un objeto ordenado dentro del código (`req.body`) para que podamos leer campos como el nombre o la especie fácilmente.

---

## 🧠 Flujos de datos y manejo de la memoria

### El ciclo de vida de un formulario (POST ➔ Redirección ➔ GET)
Cuando se envía un formulario con éxito, el sistema realiza una secuencia coordinada de tres pasos:
1. **Petición POST:** Los datos llegan al servidor para ser analizados. Si falta rellenar un campo obligatorio o se ingresa una edad inválida (por ejemplo, un número negativo), el servidor detiene el proceso, responde con un código de advertencia (`400`) y vuelve a mostrar el formulario **manteniendo escrito lo que el usuario ya había tipeado** para que no deba empezar de cero.
2. **Redirección (302):** Si los datos son válidos, se le asigna un número identificador único a la mascota y se agrega al arreglo general. Acto seguido, el servidor le envía una orden de redirección inmediata al navegador para indicarle que se mueva de allí hacia la pantalla del catálogo. Esto evita el problema clásico de que se dupliquen datos si el usuario actualiza la pestaña de forma accidental.
3. **Petición GET:** El navegador obedece la orden, solicita la página del catálogo de forma limpia y la pantalla se dibuja mostrando el nuevo registro incorporado al final de la lista.

### ¿Por qué los nuevos registros desaparecen al reiniciar la aplicación?
Al encenderse la aplicación, el servidor lee el archivo físico `mascotas.json` y almacena esa lista inicial en la **memoria RAM** del equipo (que funciona como una pizarra temporal de alta velocidad). 

Cuando agregamos una mascota mediante el formulario, esta se dibuja en esa pizarra de memoria dinámica. Dado que los nuevos registros de esta aplicación no se sobreescriben en el archivo de texto físico del disco rígido, en el momento en que el servidor se apaga o se reinicia, la memoria RAM se limpia por completo. Al encenderse nuevamente, el sistema vuelve a leer el archivo original intacto con sus datos de inicio de siempre.
 