# 🍽️ Comedor Conectado

**Comedor Conectado** es un MVP (Producto Mínimo Viable) diseñado para modernizar y optimizar la gestión de comedores populares. A través de una interfaz amigable e inteligencia artificial, facilita la administración de voluntarios, turnos, inventario y la planificación de menús nutritivos.

## ✨ Características Principales

*   **👥 Gestión de Voluntarios:** Registro, disponibilidad y control de asistencia.
*   **📅 Planificación de Turnos:** Asignación de horarios y personal de forma estructurada.
*   **📦 Control de Inventario:** Seguimiento de ingredientes disponibles y alertas de escasez.
*   **🧠 Menú Inteligente (IA):** Generación automática de recomendaciones de menús (entradas, platos principales y bebidas) utilizando la API ultrarrápida de **Groq**, basándose en los ingredientes actualmente en stock.
*   **📊 Dashboard de Impacto:** KPIs alineados con los Objetivos de Desarrollo Sostenible (ODS 2: Hambre Cero, ODS 12: Consumo Responsable).

## 🛠️ Stack Tecnológico

La arquitectura está diseñada para ser rápida, escalable y modular:

*   **Frontend (App Móvil/Web):** React Native, Expo, NativeWind, Expo Router.
*   **Backend (API REST):** FastAPI (Python) - *El backend se construirá 100% en Python, garantizando alto rendimiento y robustez en vez de Node.js/Express.*
*   **Inteligencia Artificial:** Groq API (LLM).
*   **Base de Datos:** Firebase Firestore (NoSQL, ideal para prototipado ágil y tiempo real).
*   **Despliegue:** 
    *   *Frontend:* Vercel (PWA/Web) y compilación nativa vía EAS.
    *   *Backend:* Google Cloud Run.

## 📁 Estructura del Proyecto

*   **`frontend/`**: Contiene la aplicación cliente desarrollada en React Native con Expo.
*   **`docs/`**: Documentación técnica profunda, diagramas de flujo interactivos y especificaciones de arquitectura. 
    *   *Sugerencia:* Abre `docs/flujo_modulos.html` en tu navegador para ver el diagrama de carriles del sistema.
*   **`backend/`**: Código fuente de la API (Python/FastAPI).

## 🚀 Instalación y Ejecución Local (Frontend)

1. Ingresa a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm start
   ```
   *(Presiona `w` para abrir en el navegador web, o escanea el QR con Expo Go en tu celular).*

## 📚 Documentación Adicional

*   [Arquitectura General del MVP](./docs/arquitectura_mvp_comedor_conectado.md)
*   [Especificación del Backend y Endpoints](./docs/especificacion_backend_mvp.md)
*   [Integración del Agente de IA (Groq)](./docs/integracion_groq_menu.md)
*   [Conexión Frontend ↔ Backend](./docs/conexion_frontend_backend.md)

---
*Construido con ❤️ para la comunidad.*
