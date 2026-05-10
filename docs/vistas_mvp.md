# Catálogo de Vistas MVP - Comedor Conectado

Este documento describe todas las pantallas (vistas) que conforman el MVP de la aplicación móvil "Comedor Conectado".

---

## V01 - Inicio de Sesión
- **Ruta:** `/` (`app/index.tsx`)
- **Propósito:** Permitir al administrador ingresar a la aplicación.
- **Elementos:**
  - Logo animado de "Comedor Conectado" (entrada con scale + fade).
  - Título con animación de deslizamiento ascendente.
  - Campo de correo electrónico.
  - Campo de contraseña.
  - Botón de "Iniciar Sesión" con animación de presión.
  - Opción de inicio de sesión social (Google) como placeholder.
- **Animaciones:** Entrada escalonada (logo → título → formulario) con `withDelay` + `withTiming`.

## V02 - Dashboard (Inicio)
- **Ruta:** `/(tabs)` (`app/(tabs)/index.tsx`)
- **Propósito:** Mostrar un resumen rápido del estado del comedor para el día de hoy.
- **Elementos:**
  - Saludo personalizado "Bienvenido de vuelta 👋".
  - 4 Tarjetas de estadísticas con iconos coloridos: Voluntarios, Turnos, Ingredientes, Raciones.
  - Tarjeta del último menú generado (presionable con animación de escala).
  - Desglose del menú: Entrada, Plato principal, Bebida.
- **Animaciones:** Tarjetas con entrada escalonada `FadeInDown` (0→100→200→300ms).

## V03 - Lista de Voluntarios
- **Ruta:** `/(tabs)/voluntarios` (`app/(tabs)/voluntarios.tsx`)
- **Propósito:** Mostrar todos los voluntarios registrados.
- **Elementos:**
  - Barra de búsqueda por nombre.
  - Filtros interactivos (Todos, Activos, Inactivos) con indicador visual del seleccionado.
  - Lista de tarjetas de voluntarios con avatares con iniciales coloridas, teléfono, días y estado (badge).
  - Botón flotante (FAB) animado para agregar nuevo voluntario.
- **Animaciones:** `FadeInDown` escalonado en la lista, FAB con `Easing.back` bounce.

## V04 - Nuevo Voluntario
- **Ruta:** `/voluntarios/nuevo` (`app/voluntarios/nuevo.tsx`)
- **Presentación:** Modal (slide from bottom).
- **Propósito:** Formulario para registrar un nuevo voluntario.
- **Elementos:**
  - Avatar placeholder con animación de entrada bounce.
  - Campo "Nombre completo".
  - Campo "Teléfono".
  - Selector múltiple de disponibilidad (Lun–Dom) con pills coloridos.
  - Toggle de estado (Activo/Inactivo) con indicadores rojo/verde.
  - Botón "Guardar voluntario".
- **Animaciones:** Avatar bounce, secciones con `FadeInDown` escalonado.

## V05 - Lista de Turnos
- **Ruta:** `/(tabs)/turnos` (`app/(tabs)/turnos.tsx`)
- **Propósito:** Visualizar los turnos del día y su estado de asistencia.
- **Elementos:**
  - Selector de fecha con navegación por días (flechas izquierda/derecha).
  - Filtros por horario (Todos, Mañana, Tarde, Noche).
  - Tarjetas presionables por turno: punto de color, horas, voluntarios asignados/asistieron.
  - Indicador circular de porcentaje de asistencia (color dinámico: verde/amarillo/rojo).
- **Animaciones:** `FadeInDown` escalonado en las tarjetas, Cards con animación de escala al presionar.

## V06 - Detalle de Turno (Asistencia)
- **Ruta:** `/turnos/[id]` (`app/turnos/[id].tsx`)
- **Propósito:** Ver detalles de un turno específico y marcar asistencia.
- **Elementos:**
  - Banner resumen del turno con badge de estado y estadísticas (fecha, asistidos/total).
  - Lista de voluntarios asignados con avatares de iniciales coloridos.
  - Toggle de asistencia para cada voluntario (Asistió ✅ / No asistió ❌ / Pendiente ⏳).
  - Botón fijo inferior "Guardar asistencia".
- **Animaciones:** Header `FadeInDown`, lista escalonada con delay incremental.

## V07 - Lista de Inventario
- **Ruta:** `/(tabs)/inventario` (`app/(tabs)/inventario.tsx`)
- **Propósito:** Mostrar los ingredientes disponibles y agotados en el almacén.
- **Elementos:**
  - Barra de búsqueda de ingrediente.
  - Filtros (Todos, Disponibles, Agotados).
  - Lista de ingredientes con iconos coloridos (MaterialCommunityIcons), nombre, cantidad, unidad y estado (badge).
  - Botón flotante (FAB) animado para agregar nuevo ingrediente.
- **Animaciones:** `FadeInDown` escalonado, FAB bounce.

## V08 - Nuevo Ingrediente
- **Ruta:** `/inventario/nuevo` (`app/inventario/nuevo.tsx`)
- **Presentación:** Modal (slide from bottom).
- **Propósito:** Registrar entrada de un nuevo insumo al comedor.
- **Elementos:**
  - Icono placeholder con animación de entrada bounce.
  - Campo "Nombre del ingrediente".
  - Campo "Cantidad" numérico.
  - Selector de "Unidad" con iconos descriptivos (kg, g, L, ml, Und.).
  - Toggle de "Estado" (Disponible/Agotado).
  - Botón "Guardar ingrediente".
- **Animaciones:** Icon bounce, secciones con `FadeInDown` escalonado.

## V09 - Menú Generado e IA
- **Ruta:** `/(tabs)/menu` (`app/(tabs)/menu.tsx`)
- **Propósito:** Mostrar el menú del día y permitir generar uno nuevo usando IA.
- **Elementos:**
  - **Estado sin menú:**
    - Icono mágico con animación de pulsación infinita.
    - Resumen de ingredientes disponibles.
    - Botón "Generar menú con IA" con indicador de carga.
  - **Estado con menú generado:**
    - Header visual con icono de restaurante.
    - Fecha y hora de generación.
    - Desglose: Entrada, Plato Principal, Bebida (con iconos).
    - Panel de recomendaciones con icono de lightbulb.
    - Botón "Generar nuevo menú".
- **Animaciones:** Pulsación infinita del icono mágico, entrada slide-up del resultado generado.

## V10 - Detalle de Voluntario
- **Ruta:** `/voluntarios/[id]` (`app/voluntarios/[id].tsx`)
- **Propósito:** Ver perfil completo de un voluntario, con opciones para editar y eliminar.
- **Elementos:**
  - Header con avatar grande (iniciales), nombre y badge de estado.
  - Tarjetas de estadísticas: Turnos completados y % de asistencia.
  - Sección de información: teléfono, fecha de registro.
  - Disponibilidad visual (pills de días con colores).
  - Botones de acción: "Editar voluntario" y "Eliminar voluntario" (con confirmación).
- **Animaciones:** Avatar bounce entrada, secciones con `FadeInDown` escalonado.

## V11 - Crear Turno
- **Ruta:** `/turnos/nuevo` (`app/turnos/nuevo.tsx`)
- **Presentación:** Modal (slide from bottom).
- **Propósito:** Formulario para crear un nuevo turno y asignar voluntarios.
- **Elementos:**
  - Campo de fecha del turno.
  - Selector visual de horario (Mañana ☀️ / Tarde ☁️ / Noche 🌙) con iconos y horas.
  - Lista de voluntarios disponibles con checkboxes para asignación múltiple.
  - Contador de seleccionados.
  - Botón "Crear turno (N voluntarios)".
- **Animaciones:** Secciones con `FadeInDown` escalonado.

## V12 - Editar Ingrediente
- **Ruta:** `/inventario/[id]` (`app/inventario/[id].tsx`)
- **Propósito:** Editar datos de un ingrediente existente.
- **Elementos:**
  - Header con icono del ingrediente y badge de estado.
  - Formulario pre-rellenado: nombre, cantidad, unidad, estado.
  - Selector de unidad con iconos.
  - Toggle de estado (Disponible/Agotado).
  - Botón "Guardar cambios".
  - Botón "Eliminar ingrediente" (con confirmación).
- **Animaciones:** Icono bounce entrada, formulario con `FadeInDown` escalonado.

## V13 - Historial de Menús
- **Ruta:** `/menu/historial` (`app/menu/historial.tsx`)
- **Propósito:** Listar todos los menús generados previamente por la IA.
- **Elementos:**
  - Banner resumen: total de menús generados.
  - Lista de tarjetas de menú con: fecha, entrada, plato principal, bebida, y cantidad de raciones.
  - Iconos descriptivos por tipo de plato.
- **Animaciones:** `FadeInDown` escalonado en la lista de menús.

---

## Resumen de Navegación

```
Login (V01)
  └─ Tabs (V02–V09)
       ├─ Dashboard (V02)
       ├─ Voluntarios (V03)
       │    ├─ [Modal] Nuevo Voluntario (V04)
       │    └─ Detalle Voluntario (V10)
       ├─ Turnos (V05)
       │    ├─ Detalle Turno (V06)
       │    └─ [Modal] Nuevo Turno (V11)
       ├─ Inventario (V07)
       │    ├─ [Modal] Nuevo Ingrediente (V08)
       │    └─ Editar Ingrediente (V12)
       └─ Menú IA (V09)
            └─ Historial de Menús (V13)
```
