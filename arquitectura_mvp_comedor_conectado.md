# Documento de Arquitectura MVP - Comedor Conectado

## 1. Objetivo del MVP

El MVP de **Comedor Conectado** busca entregar una aplicación móvil funcional para comedores populares que permita:

1. Registrar voluntarios.
2. Gestionar turnos y asistencia.
3. Registrar inventario básico de alimentos.
4. Generar recomendaciones de menú usando una LLM: **Grok**.
5. Mostrar indicadores simples de impacto relacionados con ODS 2: Hambre Cero y ODS 12: Producción y Consumo Responsables.

El enfoque del MVP no será construir toda la plataforma final con IoT, 5G y blockchain completos, sino dejar una base modular que permita agregar esas tecnologías en siguientes iteraciones.

---

## 2. Enfoque del proyecto

### Nombre sugerido

**Comedor Conectado: MVP móvil para gestión inteligente de voluntarios, inventario y menús solidarios**

### Problema

Los comedores populares suelen enfrentar problemas de organización operativa: falta o exceso de voluntarios, poco control de inventario, dificultad para planificar menús nutritivos y poca visibilidad sobre el uso de alimentos disponibles.

### Solución MVP

Una aplicación móvil hecha en **React Native** que permita al administrador del comedor registrar voluntarios, asignar turnos, controlar asistencia, registrar alimentos disponibles y generar un menú sugerido mediante **Grok**, considerando los ingredientes ingresados.

---

## 3. Alcance del MVP para el lunes

### Funcionalidades obligatorias

1. **Login simple o acceso de administrador**
   - Puede ser login básico con email/password o acceso simulado para demo.
   - Para ahorrar tiempo, se puede usar un usuario administrador fijo en backend o Firebase Auth si el equipo ya lo domina.

2. **Gestión de voluntarios**
   - Crear voluntario.
   - Listar voluntarios.
   - Editar voluntario.
   - Eliminar voluntario.

3. **Gestión de turnos**
   - Crear turno.
   - Asignar voluntario a turno.
   - Listar turnos por fecha.
   - Marcar asistencia.

4. **Inventario básico**
   - Registrar ingrediente.
   - Registrar cantidad aproximada.
   - Registrar unidad: kg, litros, unidades, bolsas, etc.
   - Marcar ingrediente como disponible o agotado.

5. **Generación de menú con Grok**
   - Enviar al backend la lista de ingredientes disponibles.
   - El backend llama a la API de Grok.
   - Grok devuelve una sugerencia de menú: entrada, plato principal, bebida/refresco y recomendaciones de uso.

6. **Dashboard simple**
   - Número de voluntarios registrados.
   - Turnos del día.
   - Ingredientes disponibles.
   - Último menú generado.
   - Raciones estimadas manualmente o calculadas de forma simple.

### Funcionalidades fuera del MVP

Estas quedan como proyección, no se implementan para el lunes:

1. Sensores IoT reales.
2. Conectividad 5G real.
3. Blockchain real en producción.
4. Predicción avanzada de demanda.
5. App para donantes.
6. Panel municipal o multi-comedor.
7. Sistema complejo de roles.

---

## 4. Arquitectura general

```text
[App móvil React Native]
        |
        | HTTPS / REST API
        v
[Backend API Node.js + Express]
        |
        |-----------------------> [Grok API - generación de menú]
        |
        v
[Base de datos Firestore / PostgreSQL]
        |
        v
[Servicios cloud: GCP / Firebase / Cloud Run]
```

---

## 5. Tecnologías propuestas

## 5.1 Frontend móvil

### Tecnología principal

- **React Native**
- **Expo** recomendado para acelerar el MVP
- **TypeScript** recomendado, pero JavaScript es aceptable si el equipo necesita avanzar más rápido

### Librerías sugeridas

- **Expo Router** o **React Navigation** para navegación.
- **Axios** para consumir la API.
- **React Hook Form** para formularios.
- **AsyncStorage** para guardar sesión local simple.
- **NativeWind** o estilos propios con StyleSheet.

### Pantallas principales

1. Login / Inicio
2. Dashboard
3. Voluntarios
4. Formulario de voluntario
5. Turnos
6. Formulario de turno
7. Inventario
8. Generar menú IA
9. Detalle de menú generado

---

## 5.2 Backend

### Tecnología principal

- **Node.js**
- **Express.js**
- **TypeScript** opcional

### Responsabilidades

El backend será responsable de:

1. Exponer endpoints REST.
2. Validar datos básicos.
3. Conectarse a la base de datos.
4. Consumir la API de Grok.
5. Proteger la API Key de Grok.
6. Centralizar la lógica de negocio.

### Posible despliegue

Para MVP, se recomienda una de estas opciones:

#### Opción A: GCP Cloud Run

Ideal si quieren mantener el enfoque cloud-native.

- Backend en contenedor Docker.
- Despliegue serverless.
- Escala automáticamente.
- Permite variables de entorno para la API Key de Grok.

#### Opción B: Firebase Functions

Más rápido si usan Firebase como base.

- Menos configuración de infraestructura.
- Integración directa con Firestore.
- Buena opción para MVP.

#### Opción C: Render / Railway

Opción rápida si el equipo no quiere complicarse con GCP antes del lunes.

- Despliegue simple.
- Variables de entorno fáciles.
- Menos configuración que Cloud Run.

### Recomendación

Para el lunes, usar:

- **Frontend:** React Native + Expo.
- **Backend:** Node.js + Express.
- **Base de datos:** Firestore.
- **Despliegue backend:** Cloud Run si ya tienen GCP configurado; si no, Render o Railway para demo rápida.
- **LLM:** Grok API desde backend, nunca desde el frontend.

---

## 5.3 Base de datos

### Opción recomendada para MVP

**Firestore**

Motivos:

1. Rápido de configurar.
2. Flexible para cambios de estructura.
3. Ya encaja con una arquitectura cloud.
4. Permite avanzar sin diseñar muchas tablas.

### Colecciones sugeridas

```text
voluntarios
turnos
inventario
menus_generados
asistencias
configuracion_comedor
```

### Modelo de datos inicial

#### voluntarios

```json
{
  "id": "auto",
  "nombre": "Juan Perez",
  "telefono": "999999999",
  "disponibilidad": ["lunes", "miércoles"],
  "estado": "activo",
  "createdAt": "timestamp"
}
```

#### turnos

```json
{
  "id": "auto",
  "fecha": "2026-05-11",
  "horaInicio": "08:00",
  "horaFin": "12:00",
  "voluntarioId": "abc123",
  "voluntarioNombre": "Juan Perez",
  "estado": "programado",
  "asistencia": false,
  "createdAt": "timestamp"
}
```

#### inventario

```json
{
  "id": "auto",
  "nombre": "Arroz",
  "cantidad": 20,
  "unidad": "kg",
  "fechaVencimiento": "2026-05-20",
  "estado": "disponible",
  "createdAt": "timestamp"
}
```

#### menus_generados

```json
{
  "id": "auto",
  "fecha": "2026-05-11",
  "ingredientesUsados": ["arroz", "lentejas", "zanahoria"],
  "racionesEstimadas": 50,
  "respuestaIA": "Menu generado por Grok...",
  "createdAt": "timestamp"
}
```

---

## 6. Módulos del sistema

## 6.1 Módulo de autenticación simple

### Objetivo

Permitir que el administrador del comedor ingrese a la aplicación.

### Para MVP

Puede ser una autenticación simulada:

```text
Usuario: admin@comedor.pe
Clave: 123456
```

O usar Firebase Auth si el equipo ya lo tiene listo.

### Responsable sugerido

Persona 1 o Persona 4.

---

## 6.2 Módulo de voluntarios

### Objetivo

Gestionar el registro de personas que apoyan al comedor.

### Funciones

- Crear voluntario.
- Listar voluntarios.
- Editar voluntario.
- Eliminar voluntario.
- Cambiar estado activo/inactivo.

### Endpoints

```http
GET /api/voluntarios
POST /api/voluntarios
GET /api/voluntarios/:id
PUT /api/voluntarios/:id
DELETE /api/voluntarios/:id
```

### Pantallas

- Lista de voluntarios.
- Formulario de voluntario.
- Detalle de voluntario.

### Responsable sugerido

Persona 1.

---

## 6.3 Módulo de turnos y asistencia

### Objetivo

Organizar los turnos diarios de voluntarios y controlar asistencia.

### Funciones

- Crear turno.
- Asignar voluntario.
- Listar turnos.
- Filtrar por fecha.
- Marcar asistencia.

### Endpoints

```http
GET /api/turnos
POST /api/turnos
GET /api/turnos?fecha=2026-05-11
PUT /api/turnos/:id
PATCH /api/turnos/:id/asistencia
DELETE /api/turnos/:id
```

### Pantallas

- Lista de turnos.
- Crear turno.
- Marcar asistencia.

### Responsable sugerido

Persona 2.

---

## 6.4 Módulo de inventario

### Objetivo

Registrar los ingredientes disponibles en el comedor.

### Funciones

- Crear ingrediente.
- Listar ingredientes.
- Editar cantidad.
- Marcar agotado.
- Filtrar ingredientes disponibles.

### Endpoints

```http
GET /api/inventario
POST /api/inventario
GET /api/inventario/disponibles
PUT /api/inventario/:id
PATCH /api/inventario/:id/agotado
DELETE /api/inventario/:id
```

### Pantallas

- Lista de ingredientes.
- Formulario de ingrediente.
- Inventario disponible.

### Responsable sugerido

Persona 3.

---

## 6.5 Módulo de menú con Grok

### Objetivo

Generar una recomendación de menú nutritivo usando los ingredientes disponibles.

### Flujo

```text
1. Usuario entra a la pantalla Menú IA.
2. App consulta ingredientes disponibles.
3. Usuario indica número aproximado de raciones.
4. App envía solicitud al backend.
5. Backend arma prompt.
6. Backend llama a Grok API.
7. Backend guarda la respuesta en menus_generados.
8. App muestra el menú generado.
```

### Endpoint principal

```http
POST /api/menu/generar
```

### Request

```json
{
  "raciones": 50,
  "ingredientes": [
    { "nombre": "arroz", "cantidad": 20, "unidad": "kg" },
    { "nombre": "lentejas", "cantidad": 10, "unidad": "kg" },
    { "nombre": "zanahoria", "cantidad": 5, "unidad": "kg" }
  ]
}
```

### Response

```json
{
  "menu": {
    "entrada": "Sopa ligera de verduras",
    "platoPrincipal": "Guiso de lentejas con arroz",
    "bebida": "Refresco de avena",
    "recomendaciones": [
      "Usar primero los ingredientes próximos a vencer",
      "Separar raciones para adultos mayores",
      "Controlar la sal y el aceite"
    ]
  }
}
```

### Prompt base para Grok

```text
Actúa como un nutricionista social especializado en comedores populares de Lima, Perú.
Debes generar un menú económico, nutritivo y realista usando solo o principalmente los ingredientes disponibles.

Cantidad de raciones: {raciones}
Ingredientes disponibles: {ingredientes}

Devuelve la respuesta en JSON con esta estructura:
{
  "entrada": "...",
  "platoPrincipal": "...",
  "bebida": "...",
  "ingredientesUsados": ["..."],
  "preparacionResumen": "...",
  "recomendaciones": ["..."],
  "alertas": ["..."]
}

Evita recetas costosas. Prioriza alimentos rendidores, nutritivos y culturalmente comunes en Perú.
```

### Responsable sugerido

Persona 4.

---

## 6.6 Dashboard

### Objetivo

Mostrar un resumen rápido del estado del comedor.

### Indicadores MVP

- Total de voluntarios activos.
- Turnos programados hoy.
- Asistencias confirmadas hoy.
- Ingredientes disponibles.
- Último menú generado.
- Raciones estimadas del último menú.

### Endpoint sugerido

```http
GET /api/dashboard/resumen
```

### Responsable sugerido

Persona 4 o integración entre todos.

---

## 7. Reparto del trabajo entre 4 personas

## Persona 1 - Frontend base + voluntarios

### Responsabilidades

- Crear proyecto React Native con Expo.
- Configurar navegación.
- Crear diseño base de la app.
- Implementar pantallas de voluntarios.
- Conectar voluntarios con backend.

### Entregables

- App corriendo en Expo.
- Navegación funcional.
- Pantalla Dashboard inicial.
- CRUD de voluntarios desde la app.

---

## Persona 2 - Turnos y asistencia

### Responsabilidades

- Implementar pantallas de turnos.
- Crear formulario para asignar voluntario a turno.
- Implementar marcado de asistencia.
- Consumir endpoints de turnos.

### Entregables

- Lista de turnos.
- Crear turno.
- Marcar asistencia.
- Filtrar turnos por fecha.

---

## Persona 3 - Backend + base de datos

### Responsabilidades

- Crear backend Node.js + Express.
- Configurar conexión con Firestore.
- Crear estructura de rutas.
- Implementar endpoints de voluntarios, turnos e inventario.
- Manejar variables de entorno.

### Entregables

- API REST funcional.
- Colecciones creadas en Firestore.
- Endpoints probados con Postman, Insomnia o Thunder Client.
- Archivo `.env.example`.

---

## Persona 4 - Inventario + Grok + demo final

### Responsabilidades

- Implementar módulo de inventario en frontend y backend, si Persona 3 necesita apoyo.
- Integrar Grok API desde el backend.
- Crear endpoint `/api/menu/generar`.
- Guardar menús generados.
- Preparar flujo de demo.

### Entregables

- Inventario funcional.
- Generador de menú con Grok.
- Último menú visible en dashboard.
- Demo de extremo a extremo.

---

## 8. Plan de trabajo express para llegar al lunes

## Día 1

### Backend

- Crear API Express.
- Configurar Firestore.
- Crear rutas base.
- Probar CRUD de voluntarios.

### Frontend

- Crear app Expo.
- Configurar navegación.
- Crear pantallas vacías.
- Crear componentes comunes: Button, Input, Card, Header.

---

## Día 2

### Backend

- Completar turnos.
- Completar inventario.
- Probar endpoints.

### Frontend

- Conectar voluntarios.
- Conectar turnos.
- Conectar inventario.

---

## Día 3

### Backend

- Integrar Grok.
- Crear endpoint de generación de menú.
- Guardar respuesta en base de datos.

### Frontend

- Pantalla Menú IA.
- Dashboard.
- Ajustes visuales.

---

## Día 4 / antes de presentación

- Pruebas integradas.
- Corrección de errores.
- Preparar datos de prueba.
- Grabar demo o practicar exposición.
- Tener capturas por si falla internet.

---

## 9. Endpoints finales del MVP

## Voluntarios

```http
GET /api/voluntarios
POST /api/voluntarios
GET /api/voluntarios/:id
PUT /api/voluntarios/:id
DELETE /api/voluntarios/:id
```

## Turnos

```http
GET /api/turnos
POST /api/turnos
GET /api/turnos?fecha=YYYY-MM-DD
PUT /api/turnos/:id
PATCH /api/turnos/:id/asistencia
DELETE /api/turnos/:id
```

## Inventario

```http
GET /api/inventario
POST /api/inventario
GET /api/inventario/disponibles
PUT /api/inventario/:id
PATCH /api/inventario/:id/agotado
DELETE /api/inventario/:id
```

## Menú IA

```http
POST /api/menu/generar
GET /api/menu/ultimo
GET /api/menu/historial
```

## Dashboard

```http
GET /api/dashboard/resumen
```

---

## 10. Estructura de carpetas sugerida

## Frontend React Native

```text
comedor-mobile/
  app/
    index.tsx
    login.tsx
    dashboard.tsx
    voluntarios/
      index.tsx
      nuevo.tsx
      [id].tsx
    turnos/
      index.tsx
      nuevo.tsx
    inventario/
      index.tsx
      nuevo.tsx
    menu-ia/
      index.tsx
  src/
    components/
      Button.tsx
      Input.tsx
      Card.tsx
      Header.tsx
    services/
      api.ts
      voluntarios.service.ts
      turnos.service.ts
      inventario.service.ts
      menu.service.ts
    types/
      voluntario.ts
      turno.ts
      inventario.ts
      menu.ts
    utils/
      date.ts
  package.json
```

## Backend Node.js

```text
comedor-api/
  src/
    config/
      firebase.ts
      env.ts
    routes/
      voluntarios.routes.ts
      turnos.routes.ts
      inventario.routes.ts
      menu.routes.ts
      dashboard.routes.ts
    controllers/
      voluntarios.controller.ts
      turnos.controller.ts
      inventario.controller.ts
      menu.controller.ts
      dashboard.controller.ts
    services/
      firestore.service.ts
      grok.service.ts
    middlewares/
      error.middleware.ts
    app.ts
    server.ts
  .env.example
  package.json
  Dockerfile
```

---

## 11. Reglas de seguridad mínimas para MVP

1. La API Key de Grok nunca debe estar en React Native.
2. La API Key debe estar en `.env` o variable de entorno cloud.
3. El frontend solo llama al backend.
4. El backend llama a Grok.
5. No subir `.env` al repositorio.
6. Usar `.env.example` para mostrar qué variables se necesitan.
7. Validar que los campos obligatorios no lleguen vacíos.
8. No guardar información sensible innecesaria de beneficiarios.

---

## 12. Variables de entorno sugeridas

```env
PORT=3000
NODE_ENV=development

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

GROK_API_KEY=
GROK_MODEL=grok-2-latest
```

---

## 13. Integración con Grok

## Ubicación

La integración debe estar en:

```text
backend/src/services/grok.service.ts
```

## Responsabilidad

Este servicio debe:

1. Recibir ingredientes y raciones.
2. Construir el prompt.
3. Llamar a Grok API.
4. Devolver una respuesta estructurada.
5. Manejar errores si la LLM no responde.

## Respuesta alternativa si Grok falla

Para evitar que la demo se caiga, implementar fallback:

```json
{
  "entrada": "Sopa de verduras",
  "platoPrincipal": "Arroz con menestra",
  "bebida": "Refresco natural",
  "recomendaciones": [
    "Usar primero los ingredientes más próximos a vencer",
    "Ajustar las porciones según la asistencia real"
  ]
}
```

---

## 14. Demo sugerida para el profesor

## Historia de usuario para presentar

> La administradora de un comedor popular ingresa a la app, registra voluntarios, programa turnos, marca asistencia, registra ingredientes disponibles y genera un menú nutritivo con IA para 50 personas. Luego visualiza un resumen del impacto operativo del día.

## Flujo de demo

1. Iniciar sesión.
2. Ver dashboard inicial.
3. Registrar dos voluntarios.
4. Crear turnos para el día.
5. Marcar asistencia de un voluntario.
6. Registrar ingredientes disponibles.
7. Ir a Menú IA.
8. Ingresar 50 raciones.
9. Generar menú con Grok.
10. Volver al dashboard y mostrar resumen.

---

## 15. Cómo justificar IA, 5G y blockchain sin implementarlo todo aún

## IA en el MVP

Sí se implementa en el MVP mediante Grok para generar menús usando ingredientes reales del inventario.

## 5G como siguiente fase

Para el MVP, se deja preparado el módulo de inventario para que luego pueda recibir datos desde sensores conectados por 5G, como sensores de peso o temperatura.

Ejemplo de evolución:

```text
Sensor de peso -> Red 5G -> Backend -> Inventario actualizado en tiempo real
```

## Blockchain como siguiente fase

Para el MVP, no se implementa blockchain real. Se diseña la arquitectura para que en una siguiente versión se registren donaciones y uso de alimentos en una red blockchain.

Ejemplo de evolución:

```text
Donación recibida -> Backend genera hash -> Blockchain registra evidencia -> Donante verifica con QR
```

---

## 16. Priorización MoSCoW

## Must have

- App móvil en React Native.
- CRUD de voluntarios.
- Gestión de turnos.
- Inventario básico.
- Menú generado con Grok.
- Backend API.
- Base de datos.

## Should have

- Dashboard.
- Historial de menús.
- Marcar asistencia.
- Fallback si Grok falla.

## Could have

- Login real.
- Filtros por fecha.
- Reporte de impacto.
- Diseño visual mejorado.

## Won't have para el lunes

- Blockchain funcional.
- Sensores reales.
- 5G real.
- Predicción avanzada.
- Roles complejos.

---

## 17. Decisiones técnicas finales

| Elemento | Decisión MVP |
|---|---|
| Aplicación | React Native con Expo |
| Backend | Node.js + Express |
| Base de datos | Firestore |
| IA | Grok API |
| Deploy frontend | Expo Go para demo o build APK si hay tiempo |
| Deploy backend | Cloud Run, Render o Railway |
| Seguridad | API Key solo en backend |
| Arquitectura | REST API modular |
| Enfoque ODS | ODS 2 y ODS 12 |

---

## 18. Resultado esperado del MVP

Al finalizar el MVP, el equipo debe tener una aplicación móvil funcional donde se pueda demostrar el siguiente flujo completo:

```text
Registrar voluntarios -> Programar turnos -> Registrar inventario -> Generar menú con Grok -> Ver resumen del día
```

Este MVP será suficiente para demostrar valor real porque conecta la operación diaria del comedor con una herramienta de inteligencia artificial aplicada a una necesidad concreta: alimentar mejor, organizar mejor y desperdiciar menos.



---

# 19. Vistas necesarias para el MVP

Esta sección describe las pantallas mínimas que debe tener la aplicación móvil para demostrar el flujo principal del MVP.

## 19.1 Vista de Login / Acceso

### Objetivo

Permitir que el administrador del comedor ingrese a la aplicación.

### Descripción

Para el MVP, esta vista puede funcionar con un acceso simple de administrador. No es obligatorio implementar autenticación avanzada, pero sí debe simular un flujo real de ingreso.

### Elementos principales

- Campo de correo o usuario.
- Campo de contraseña.
- Botón de iniciar sesión.
- Mensaje de error si las credenciales son incorrectas.

### Funcionalidad mínima

- Validar que los campos no estén vacíos.
- Permitir ingreso con credenciales de prueba.
- Redirigir al Dashboard después del login.

### Prioridad

Alta.

---

## 19.2 Vista de Dashboard / Inicio

### Objetivo

Mostrar un resumen rápido del estado operativo del comedor.

### Descripción

Es la pantalla principal después del login. Debe permitir que el administrador vea información resumida sin entrar a cada módulo.

### Elementos principales

- Total de voluntarios activos.
- Turnos programados para hoy.
- Asistencias confirmadas.
- Ingredientes disponibles.
- Último menú generado con Grok.
- Accesos rápidos a Voluntarios, Turnos, Inventario y Menú IA.

### Funcionalidad mínima

- Consultar el endpoint `/api/dashboard/resumen`.
- Mostrar tarjetas con indicadores básicos.
- Permitir navegación rápida a los módulos principales.

### Prioridad

Alta.

---

## 19.3 Vista de Lista de Voluntarios

### Objetivo

Mostrar todos los voluntarios registrados en el comedor.

### Descripción

Esta vista permite al administrador consultar quiénes forman parte del equipo de apoyo del comedor.

### Elementos principales

- Lista de voluntarios.
- Nombre del voluntario.
- Teléfono.
- Estado: activo o inactivo.
- Botón para crear nuevo voluntario.
- Opción para editar o eliminar.

### Funcionalidad mínima

- Consumir `GET /api/voluntarios`.
- Navegar al formulario de nuevo voluntario.
- Navegar al detalle o edición de voluntario.
- Eliminar voluntario si es necesario.

### Prioridad

Alta.

---

## 19.4 Vista de Crear / Editar Voluntario

### Objetivo

Registrar o modificar los datos de un voluntario.

### Descripción

Esta pantalla contiene un formulario simple para ingresar información básica de cada voluntario.

### Elementos principales

- Nombre completo.
- Teléfono.
- Disponibilidad.
- Estado.
- Botón guardar.
- Botón cancelar o volver.

### Funcionalidad mínima

- Validar nombre obligatorio.
- Enviar datos al backend con `POST /api/voluntarios`.
- Actualizar datos con `PUT /api/voluntarios/:id`.
- Mostrar mensaje de éxito o error.

### Prioridad

Alta.

---

## 19.5 Vista de Lista de Turnos

### Objetivo

Visualizar los turnos programados del comedor.

### Descripción

Permite ver qué voluntarios están asignados a determinados horarios y fechas.

### Elementos principales

- Lista de turnos.
- Fecha.
- Hora de inicio.
- Hora de fin.
- Voluntario asignado.
- Estado de asistencia.
- Botón para crear turno.
- Filtro por fecha.

### Funcionalidad mínima

- Consumir `GET /api/turnos`.
- Filtrar por fecha usando `GET /api/turnos?fecha=YYYY-MM-DD`.
- Navegar a crear turno.
- Permitir marcar asistencia.

### Prioridad

Alta.

---

## 19.6 Vista de Crear / Editar Turno

### Objetivo

Programar un turno para un voluntario.

### Descripción

Esta pantalla permite seleccionar un voluntario, una fecha y un horario para asignarlo al comedor.

### Elementos principales

- Selector de voluntario.
- Fecha del turno.
- Hora de inicio.
- Hora de fin.
- Estado del turno.
- Botón guardar.

### Funcionalidad mínima

- Consultar voluntarios disponibles.
- Crear turno con `POST /api/turnos`.
- Editar turno con `PUT /api/turnos/:id`.
- Validar que fecha y voluntario sean obligatorios.

### Prioridad

Alta.

---

## 19.7 Vista de Asistencia

### Objetivo

Registrar si un voluntario asistió o no a su turno.

### Descripción

Puede ser una vista independiente o una acción dentro de la lista de turnos. Para el MVP, se recomienda incluirla dentro de la vista de turnos para ahorrar tiempo.

### Elementos principales

- Nombre del voluntario.
- Fecha y horario del turno.
- Estado actual de asistencia.
- Botón marcar asistencia.
- Botón desmarcar asistencia, opcional.

### Funcionalidad mínima

- Enviar actualización a `PATCH /api/turnos/:id/asistencia`.
- Cambiar visualmente el estado del turno.
- Actualizar el dashboard.

### Prioridad

Alta.

---

## 19.8 Vista de Inventario

### Objetivo

Mostrar los ingredientes disponibles en el comedor.

### Descripción

Esta vista permite controlar de forma básica qué alimentos tiene el comedor para preparar los menús.

### Elementos principales

- Lista de ingredientes.
- Nombre del ingrediente.
- Cantidad.
- Unidad de medida.
- Estado: disponible o agotado.
- Fecha de vencimiento, si se implementa.
- Botón para agregar ingrediente.

### Funcionalidad mínima

- Consumir `GET /api/inventario`.
- Mostrar ingredientes disponibles.
- Editar cantidad.
- Marcar ingrediente como agotado.
- Eliminar ingrediente si fue registrado por error.

### Prioridad

Alta.

---

## 19.9 Vista de Crear / Editar Ingrediente

### Objetivo

Registrar o modificar alimentos del inventario.

### Descripción

Permite ingresar los ingredientes disponibles para que luego sean usados por Grok en la generación del menú.

### Elementos principales

- Nombre del ingrediente.
- Cantidad.
- Unidad: kg, litros, unidades, bolsas, etc.
- Fecha de vencimiento, opcional para MVP.
- Estado.
- Botón guardar.

### Funcionalidad mínima

- Crear ingrediente con `POST /api/inventario`.
- Editar ingrediente con `PUT /api/inventario/:id`.
- Validar nombre, cantidad y unidad.

### Prioridad

Alta.

---

## 19.10 Vista de Menú IA con Grok

### Objetivo

Generar un menú nutritivo usando la lista de ingredientes disponibles.

### Descripción

Esta es una de las vistas más importantes para la demo, porque demuestra el uso real de inteligencia artificial dentro del proyecto.

### Elementos principales

- Lista de ingredientes disponibles.
- Campo para número de raciones.
- Botón generar menú.
- Indicador de carga mientras Grok responde.
- Resultado generado.

### Funcionalidad mínima

- Consultar ingredientes disponibles.
- Enviar raciones e ingredientes a `POST /api/menu/generar`.
- Mostrar el menú generado por Grok.
- Guardar el menú en la base de datos.
- Mostrar mensaje alternativo si Grok falla.

### Prioridad

Muy alta.

---

## 19.11 Vista de Resultado de Menú

### Objetivo

Mostrar de forma clara la respuesta generada por Grok.

### Descripción

Puede ser parte de la misma vista de Menú IA o una pantalla separada. Para el MVP, se recomienda mostrar el resultado en la misma pantalla para reducir trabajo.

### Elementos principales

- Entrada sugerida.
- Plato principal.
- Bebida o refresco.
- Ingredientes usados.
- Resumen de preparación.
- Recomendaciones.
- Alertas.

### Funcionalidad mínima

- Mostrar la respuesta de Grok en formato ordenado.
- Permitir volver al Dashboard.
- Permitir generar otro menú.

### Prioridad

Alta.

---

## 19.12 Vista de Historial de Menús

### Objetivo

Consultar menús generados anteriormente.

### Descripción

Esta vista es útil para mostrar que las respuestas de la IA no se pierden y que el comedor puede revisar sus menús anteriores.

### Elementos principales

- Lista de menús generados.
- Fecha de generación.
- Número de raciones.
- Ingredientes usados.
- Botón para ver detalle.

### Funcionalidad mínima

- Consumir `GET /api/menu/historial`.
- Mostrar menús guardados.
- Ver detalle de un menú.

### Prioridad

Media. Si no alcanza el tiempo, se puede dejar para después del MVP.

---

# 20. Vistas faltantes para el proyecto completo

Estas pantallas no son obligatorias para el MVP del lunes, pero serían necesarias para convertir el sistema en una plataforma completa y más sólida.

## 20.1 Vista de Registro de Beneficiarios Agregados

### Objetivo

Registrar cuántas personas fueron atendidas por día sin guardar datos personales sensibles.

### Descripción

Permite registrar la cantidad de raciones entregadas y clasificar la atención de forma general.

### Elementos principales

- Fecha.
- Total de raciones entregadas.
- Cantidad de adultos.
- Cantidad de niños.
- Cantidad de adultos mayores.
- Observaciones.

### Valor para el proyecto

Ayuda a medir impacto real del comedor y mejora la predicción de demanda.

---

## 20.2 Vista de Predicción de Demanda

### Objetivo

Estimar cuántas raciones se necesitarán en próximos días.

### Descripción

Usaría datos históricos de atención, inventario, turnos y posiblemente factores externos para recomendar la cantidad de comida a preparar.

### Elementos principales

- Fecha a predecir.
- Raciones estimadas.
- Nivel de confianza.
- Voluntarios recomendados.
- Ingredientes críticos.

### Valor para el proyecto

Reduce desperdicio y evita que falten raciones.

---

## 20.3 Vista de Donaciones

### Objetivo

Registrar alimentos, dinero u otros recursos donados al comedor.

### Descripción

Permite llevar control de quién donó, qué se recibió, en qué cantidad y cuándo.

### Elementos principales

- Nombre del donante.
- Tipo de donación.
- Cantidad.
- Unidad.
- Fecha.
- Estado de la donación.
- Evidencia de entrega.

### Valor para el proyecto

Es la base para implementar trazabilidad con blockchain.

---

## 20.4 Vista de Detalle de Donación

### Objetivo

Consultar el estado completo de una donación.

### Descripción

Muestra el ciclo de vida de la donación desde que se registra hasta que se utiliza en un menú.

### Elementos principales

- Datos del donante.
- Alimentos o recursos donados.
- Estado actual.
- Fecha de recepción.
- Fecha de uso.
- Menú asociado.
- Evidencia o comprobante.

### Valor para el proyecto

Aporta transparencia y confianza para donantes, ONGs o municipalidades.

---

## 20.5 Vista de Trazabilidad Blockchain

### Objetivo

Mostrar los eventos verificables registrados en blockchain.

### Descripción

Permite verificar que una donación fue recibida, usada y asociada a un impacto concreto.

### Elementos principales

- Código de donación.
- Hash de transacción.
- Estado de trazabilidad.
- Eventos registrados.
- Fecha y hora de cada evento.
- Botón para copiar o verificar hash.

### Valor para el proyecto

Demuestra transparencia en el uso de recursos donados.

---

## 20.6 Vista de QR de Verificación para Donantes

### Objetivo

Permitir que un donante consulte el uso de su donación mediante un QR.

### Descripción

El sistema genera un código QR asociado a la donación. Al escanearlo, el donante puede ver un resumen del impacto generado.

### Elementos principales

- QR de donación.
- Código único.
- Estado de la donación.
- Raciones generadas.
- Fecha de uso.
- Hash de verificación.

### Valor para el proyecto

Convierte blockchain en una función visible y entendible para usuarios no técnicos.

---

## 20.7 Vista de Sensores IoT / 5G

### Objetivo

Mostrar datos recibidos desde sensores conectados al comedor.

### Descripción

Esta vista permitiría monitorear información en tiempo real desde sensores de peso, temperatura u otros dispositivos.

### Elementos principales

- Lista de sensores.
- Estado del sensor: activo o inactivo.
- Última lectura.
- Ingrediente asociado.
- Temperatura o peso registrado.
- Fecha y hora de actualización.

### Valor para el proyecto

Justifica la incorporación de 5G como tecnología para transmisión de datos en tiempo real.

---

## 20.8 Vista de Alertas Inteligentes

### Objetivo

Centralizar avisos importantes generados por el sistema.

### Descripción

Agrupa alertas relacionadas con inventario, asistencia, demanda, vencimientos y donaciones.

### Elementos principales

- Ingredientes por vencer.
- Stock bajo.
- Falta de voluntarios.
- Alta demanda estimada.
- Donaciones pendientes de recepción.
- Fallas de sensores.

### Valor para el proyecto

Ayuda a tomar decisiones rápidas y mejora la operación diaria.

---

## 20.9 Vista de Reporte de Impacto ODS

### Objetivo

Mostrar indicadores relacionados con ODS 2 y ODS 12.

### Descripción

Permite evidenciar el impacto social y ambiental del comedor.

### Elementos principales

- Raciones servidas.
- Personas atendidas.
- Menús generados.
- Kg de alimentos usados antes de vencer.
- Kg de desperdicio evitado.
- Donaciones trazadas.
- Turnos cubiertos.

### Valor para el proyecto

Convierte el sistema en una herramienta medible y defendible para una presentación académica o institucional.

---

## 20.10 Vista de Perfil de Voluntario

### Objetivo

Permitir que cada voluntario consulte sus turnos y disponibilidad.

### Descripción

En la versión completa, no solo el administrador usaría la app. Cada voluntario podría ingresar y gestionar su participación.

### Elementos principales

- Datos del voluntario.
- Próximos turnos.
- Historial de asistencia.
- Disponibilidad semanal.
- Botón para confirmar turno.

### Valor para el proyecto

Reduce la carga administrativa del encargado del comedor.

---

## 20.11 Vista de Notificaciones

### Objetivo

Mostrar avisos enviados a administradores o voluntarios.

### Descripción

Permite ver recordatorios y alertas importantes dentro de la app.

### Elementos principales

- Recordatorio de turno.
- Aviso de menú generado.
- Alerta de stock bajo.
- Alerta de ingrediente por vencer.
- Confirmación de donación recibida.

### Valor para el proyecto

Mejora la comunicación y evita olvidos operativos.

---

## 20.12 Vista de Configuración del Comedor

### Objetivo

Configurar datos generales del comedor.

### Descripción

Permite personalizar el sistema según el comedor que lo utiliza.

### Elementos principales

- Nombre del comedor.
- Dirección.
- Responsable.
- Teléfono.
- Capacidad aproximada de atención.
- Horario de funcionamiento.
- Número promedio de raciones.

### Valor para el proyecto

Permite escalar el sistema a múltiples comedores.

---

## 20.13 Vista Multi-Comedor para Municipalidad u ONG

### Objetivo

Permitir que una organización supervise varios comedores.

### Descripción

Una municipalidad, ONG o red comunitaria podría revisar el estado de múltiples comedores desde un solo panel.

### Elementos principales

- Lista de comedores.
- Estado operativo de cada comedor.
- Raciones servidas por comedor.
- Alertas por comedor.
- Donaciones asignadas.
- Comparación de indicadores.

### Valor para el proyecto

Convierte la solución en una plataforma escalable, no solo una app para un comedor.

---

## 20.14 Vista de Auditoría y Logs

### Objetivo

Registrar acciones importantes realizadas por los usuarios.

### Descripción

Permite saber quién creó, modificó o eliminó información relevante.

### Elementos principales

- Usuario que realizó la acción.
- Acción realizada.
- Fecha y hora.
- Módulo afectado.
- Datos anteriores y nuevos, si aplica.

### Valor para el proyecto

Mejora seguridad, control y trazabilidad interna.

---

## 20.15 Vista de Administración de Usuarios y Roles

### Objetivo

Gestionar permisos dentro del sistema.

### Descripción

Permite crear usuarios y asignarles roles como administrador, voluntario, donante o supervisor.

### Elementos principales

- Lista de usuarios.
- Rol asignado.
- Estado del usuario.
- Crear usuario.
- Cambiar rol.
- Desactivar usuario.

### Valor para el proyecto

Es necesaria para una versión real con múltiples tipos de usuarios.

---

# 21. Resumen de vistas por prioridad

## Vistas obligatorias para el MVP

1. Login / Acceso.
2. Dashboard.
3. Lista de voluntarios.
4. Crear / Editar voluntario.
5. Lista de turnos.
6. Crear / Editar turno.
7. Asistencia.
8. Inventario.
9. Crear / Editar ingrediente.
10. Menú IA con Grok.
11. Resultado de menú.

## Vistas recomendadas si alcanza el tiempo

1. Historial de menús.
2. Dashboard un poco más visual.
3. Filtro de turnos por fecha.
4. Detalle de voluntario.

## Vistas para la versión completa

1. Registro de beneficiarios agregados.
2. Predicción de demanda.
3. Donaciones.
4. Detalle de donación.
5. Trazabilidad blockchain.
6. QR de verificación para donantes.
7. Sensores IoT / 5G.
8. Alertas inteligentes.
9. Reporte de impacto ODS.
10. Perfil de voluntario.
11. Notificaciones.
12. Configuración del comedor.
13. Multi-comedor para municipalidad u ONG.
14. Auditoría y logs.
15. Administración de usuarios y roles.

