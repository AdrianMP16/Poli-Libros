Poli-Libros: Plataforma de Compra y Venta de Libros Usados
1. Descripción del Proyecto
Poli-Libros es una aplicación web diseñada para facilitar el intercambio de material bibliográfico específico entre los estudiantes del Centro de Educación Continua (CEC) de la Escuela Politécnica Nacional (EPN). El proyecto surge como una solución organizada para reemplazar la gestión ineficiente y desordenada de los grupos de mensajería instantánea actuales.

La plataforma permite a los usuarios visualizar una lista de libros disponibles, gestionar publicaciones de venta y establecer contacto directo para coordinar entregas físicas dentro del campus universitario.

2. Características Principales
Visualización de Catálogo: Listado dinámico de libros presentados en tarjetas que incluyen nombre, precio y estado actual.

Gestión de Estados: Clasificación en tiempo real de los artículos como "Disponible" o "En negociaciones".

Autenticación Institucional: Sistema de acceso mediante Firebase Auth, orientado al uso del correo estudiantil institucional (@epn.edu.ec).

Sistema de Chat: Canal de comunicación integrado entre comprador e interesado para acordar puntos de reunión y detalles de la entrega.

3. Tecnologías Utilizadas
Frontend: Vite y React para la construcción de una interfaz de usuario reactiva y eficiente.

Backend: Node.js con el framework Express para la gestión de la lógica de servidor y API.

Base de Datos: Cloud Firestore (NoSQL) para el almacenamiento de libros, usuarios y mensajes en tiempo real.

Autenticación: Firebase Authentication para la gestión segura de identidades.

4. Estructura de Datos (Firestore)
La colección principal de la base de datos se denomina libros y contiene los siguientes campos técnicos:

titulo (string): Nombre del texto del CEC.

nivel (string): Nivel de inglés correspondiente al curso.

precio (double): Valor monetario asignado por el vendedor.

estado (string): Indicador de disponibilidad del producto.

incluye_codigo (boolean): Verificación de la vigencia del código de plataforma digital.

vendedor_id (string): Identificador único del usuario propietario.

5. Instalación y Configuración
Para ejecutar el proyecto localmente, se deben seguir estos pasos:

Clonar el repositorio.

Configurar las dependencias en ambas carpetas:

Bash
cd frontend && npm install
cd ../backend && npm install
Colocar el archivo de credenciales de Firebase (.json) en la carpeta backend.

Iniciar los servicios:

Frontend: npm run dev.

Backend: node index.js.

6. Notas de Seguridad
El archivo de clave privada de Firebase y las carpetas de dependencias (node_modules) están configurados en el .gitignore raíz para evitar su exposición en repositorios públicos.
