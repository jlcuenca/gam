# Espacios GAM - Radiografía de Territorio

Aplicación móvil-first para la gestión estratégica de espacios públicos en la Alcaldía Gustavo A. Madero. Diseñada para directores generales y el Alcalde para el seguimiento de recorridos de territorio.

## 🚀 Cómo Iniciar el Proyecto

Para ejecutar la aplicación en modo de desarrollo:

```bash
cd espacios
npm install
npm run dev
```

> **Nota:** Asegúrate de usar `npm run dev` (no `run npm dev`).

---

## 🧪 Guía de Pruebas Estratégicas

Sigue estos pasos para verificar las funcionalidades clave de la aplicación:

### 1. Verificación de Datos Reales y Clima Político
*   **Búsqueda**: En la barra de búsqueda principal, escribe **"Futurama"** o **"Galeana"**.
*   **Vista de Detalle**: Haz clic en la tarjeta del **"Mercado Gertrudis Sánchez"**.
*   **Información Política**: Desliza hacia abajo para encontrar la sección **"Clima Político"**. Deberás ver el análisis sobre la organización de comerciantes y el nombre de la líder (**Elena Pineda**) con su estatus de **"Aliado"**.

### 2. Prueba del Mapa (Estrategia Espacial)
*   **Cambiar Vista**: Haz clic en el icono de **"Mapa"** en la barra de navegación inferior.
*   **Interacción**: Haz clic en un **Marcador Rojo** (estatus Crítico). Debería abrir el detalle de un espacio como el **"Mercado Vicente Guerrero"**.
*   **Carrusel**: Desliza la lista horizontal en la parte inferior del mapa para saltar rápidamente entre los espacios más importantes.

### 3. Prueba del Formulario de Captura (Participación Ciudadana)
*   **Abrir Formulario**: Haz clic en el botón flotante **(+) FAB** en el centro de la barra inferior.
*   **Seleccionar Director**: Cambia el "Director Responsable" a **"Participación Ciudadana"**.
*   **Campos Dinámicos**: Aparecerá una sección con borde verde específica para **"Clima Político"** y **"Líderes"**.
*   **Agregar Líder**: Escribe un nombre y haz clic en **(+)**. El líder aparecerá como una etiqueta eliminable.
*   **Guardar**: Completa el nombre del espacio y haz clic en **"Guardar Captura"**. Serás redirigido a la lista y tu nuevo espacio aparecerá al principio.

### 4. Filtrado por Colonias
*   **Abrir Filtro**: Haz clic en el icono de **Filtro** (junto a la barra de búsqueda).
*   **Seleccionar**: Busca y marca **"Lindavista"** y **"Cuautepec"**.
*   **Aplicar**: Haz clic en "Aplicar". La lista solo mostrará espacios en esas colonias.
*   **Eliminar**: Haz clic en la **"X"** de las etiquetas de filtro que aparecen sobre la lista para borrarlas individualmente.

---

## 🛠️ Stack Tecnológico
*   **React + TypeScript**
*   **Vite** (Build tool)
*   **Framer Motion** (Animaciones premium)
*   **Lucide React** (Iconografía estratégica)
*   **CSS Variables** (Sistema de diseño institucional GAM)
