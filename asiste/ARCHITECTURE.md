# Arquitectura: Sistema de Asistencia GAM (ASISTE)

## 1. Estructura Piramidal y Jerarquía
El sistema está diseñado para gestionar **2,000 trabajadores** distribuidos en células de **20 personas**.

*   **Trabajador**: Usuario final que genera su QR dinámico o presenta su INE.
*   **Supervisor**: Responsable de una célula. Valida la presencia física, escanea QRs/INEs y realiza la validación grupal (selfie).
*   **Administrador (Alcaldía)**: Visualiza el dashboard en tiempo real, configura eventos y perímetros.

## 2. Métodos de Registro y Seguridad
### A. QR Dinámico (Anti-Fraude)
*   Generado en el dispositivo del trabajador.
*   **Rotación**: Cambia cada 30 segundos.
*   **Hash Temporal**: Incluye `timestamp + device_id + user_id`.
*   **Visual**: Fondo de color aleatorio para detectar capturas de pantalla estáticas.

### B. Escaneo de INE (PDF417)
*   Uso de la cámara para leer el código PDF417 al reverso de la credencial.
*   Extracción automática de CURP para validación contra el padrón.

### C. Proximidad Bluetooth (BLE)
*   El celular del Supervisor actúa como un **Beacon**.
*   El trabajador solo puede marcar asistencia si el supervisor está en rango (< 10m).

### D. Validación Geográfica (Geofencing)
*   **Perímetro**: Solo se permite el registro dentro de las coordenadas del evento.
*   **Mock Location**: Detección de APIs de ubicación falsa.

## 3. Esquema de Base de Datos (Propuesta)

### Tabla: `users`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único |
| `name` | String | Nombre completo |
| `curp` | String | Identificador oficial |
| `role` | Enum | `worker`, `supervisor`, `admin` |
| `cell_id` | UUID | ID de la célula a la que pertenece |
| `device_id` | String | ID único del hardware vinculado |

### Tabla: `events`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único |
| `name` | String | Nombre del evento masivo |
| `lat`, `lng` | Float | Coordenadas centrales |
| `radius` | Int | Radio permitido en metros |
| `start_time` | Timestamp | Inicio del evento |

### Tabla: `attendance`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único |
| `user_id` | UUID | ID del trabajador |
| `event_id` | UUID | ID del evento |
| `timestamp` | Timestamp | Hora del servidor |
| `method` | String | `QR`, `INE`, `BLE`, `MANUAL` |
| `photo_url` | String | URL de la selfie grupal vinculada |
| `status` | String | `PRESENTE`, `RETARDO`, `FALTA` |

## 4. Stack Tecnológico Recomendado
*   **Frontend**: React + TypeScript (Vite) - Alta velocidad y mantenibilidad.
*   **Estilos**: Vanilla CSS con variables para diseño premium.
*   **Backend/DB**: **Supabase** (PostgreSQL).
    *   *Costo*: Nivel gratuito generoso, escalable.
    *   *Real-time*: Para ver el pase de lista en vivo en el dashboard.
*   **PWA**: Configurado como Progressive Web App para instalación directa sin pasar por App Store/Play Store (ahorro de costos de licencia).
