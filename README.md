## Poli-Libros: Plataforma de Compra y Venta de Libros Usados
**1. Descripción del Proyecto:**
Poli-Libros es una aplicación web diseñada para facilitar el intercambio de material bibliográfico específico entre los estudiantes del Centro de Educación Continua (CEC) de la Escuela Politécnica Nacional (EPN). El proyecto surge como una solución organizada para reemplazar la gestión ineficiente y desordenada de los grupos de mensajería instantánea actuales.

La plataforma permite a los usuarios visualizar una lista de libros disponibles, gestionar publicaciones de venta y establecer contacto directo para coordinar entregas físicas dentro del campus universitario.

**2. Características Principales:**
Visualización de Catálogo: Listado dinámico de libros presentados en tarjetas que incluyen nombre, precio y estado actual.

Gestión de Estados: Clasificación en tiempo real de los artículos como "Disponible" o "Vendido".

Autenticación Institucional: Sistema de acceso mediante Firebase Auth, orientado al uso del correo estudiantil institucional (@epn.edu.ec), o también con los correos personales de los estudiantes.

Sistema de Chat: Canal de comunicación integrado entre comprador e interesado para acordar puntos de reunión y detalles de la entrega.

**3. Tecnologías Utilizadas:**
Frontend: Vite y React para la construcción de una interfaz de usuario reactiva y eficiente.

Backend: Node.js con el framework Express para la gestión de la lógica de servidor y API.

Base de Datos: Cloud Firestore (NoSQL) para el almacenamiento de libros, usuarios y mensajes en tiempo real.

Autenticación: Firebase Authentication para la gestión segura de identidades.

**4. Estructura de Datos (Firestore):**
La colección principal de la base de datos se denomina libros y contiene los siguientes campos técnicos:

titulo (string): Nombre del texto del CEC.

nivel (string): Nivel de inglés correspondiente al curso.

precio (double): Valor monetario asignado por el vendedor.

estado (string): Indicador de disponibilidad del producto.

incluye_codigo (boolean): Verificación de la vigencia del código de plataforma digital.

vendedor_id (string): Identificador único del usuario propietario.

id (string): Identificador único del libro.

descripcion (string): Descripción que provee el vendedor al libro.

estado_fisico (): Está en dos estados, usado (pero limpio) o con detalles.

imagen_url (): Url de la imagen del libro en Cloudinary.

fecha_publicacion (): Fecha en la cuál se publicó el libro.

disponibilidad (): Indica si el libro está disponible para su venta, o vendido.

**5. Instalación y Configuración:**
Para ejecutar el proyecto localmente, se deben seguir estos pasos:
Clonar el repositorio.
Configurar las dependencias en ambas carpetas:

Bash
cd frontend && npm install
cd ../backend && npm install
Colocar el archivo de credenciales en los archivos .env con tus propias credenciales para todo lo que se requiera, sigue el ejemplo de .env.example.

Iniciar los servicios:

Frontend: npm run dev.
Backend: node index.js.

**6. Notas de Seguridad:**
El archivo de las credenciales y las carpetas de dependencias (node_modules) están configurados en el .gitignore raíz para evitar su exposición en repositorios públicos.

**7. Capturas del progreso del proyecto:**

Login:
<img width="1877" height="998" alt="image" src="https://github.com/user-attachments/assets/3dc96aae-5c84-455f-b98b-f19e03f69c39" />

Panel de control del usuario registrado:
<img width="1877" height="998" alt="image" src="https://github.com/user-attachments/assets/6f0a33c6-c985-431a-82b5-34c600ec4e6a" />

Panel de control de Supabase
<img width="1600" height="834" alt="376ec02e-3775-42b6-b922-34139c421dab" src="https://github.com/user-attachments/assets/07c36848-4bbe-4f1f-889d-4e0dad892f85" />

Base de datos en Firebase
<img width="1600" height="856" alt="7766c86f-a4cb-4b51-a2ae-5906595a9acf" src="https://github.com/user-attachments/assets/e9911115-7aba-4822-ad9f-ed942097cee8" />

**8. Link Permanente de Vercel (Frontend):**

https://poli-libros-wine.vercel.app

**9. Link Permanente de Render (Backend):**

https://poli-libros-backend.onrender.com
