# ASISTE GAM - Sistema de Asistencia de Alta Seguridad

Tercera aplicación de la suite GAM, diseñada para el control de asistencia de 2,000 trabajadores en eventos masivos.

## 🚀 Inicio Rápido

```bash
cd asiste
npm install
npm run dev
```

## 🛡️ Características Implementadas (Demo)

### 1. Vista del Trabajador
*   **QR Dinámico**: Generación de códigos QR que rotan cada 30 segundos para evitar fraudes por captura de pantalla.
*   **Geofencing**: Simulación de validación por GPS (solo permite registro dentro del perímetro).
*   **BLE Proximity**: Interfaz preparada para detección de proximidad con el supervisor.

### 2. Vista del Supervisor
*   **Escaneo Dual**: Interfaz para escaneo rápido de QR (trabajador) e INE (PDF417).
*   **Gestión de Células**: Visualización del estatus de los 20 integrantes de la célula en tiempo real.
*   **Validación Grupal**: Módulo de Selfie Grupal vinculado a geolocalización.
*   **Beacon Mode**: El dispositivo del supervisor emite una señal de proximidad.

## 🏗️ Arquitectura
Consulta el archivo [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles técnicos sobre la base de datos (Supabase), protocolos anti-fraude y diagrama de flujo.

---
**Alcaldía Gustavo A. Madero**
"Transformando el territorio con tecnología"
