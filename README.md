# 🖥️ Sergio.v95 — Retro Operating System Portfolio

<div align="center">

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://sergioandresaparicio.github.io/portafolio/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Una experiencia de usuario interactiva y nostálgica inspirada en Windows 95, diseñada para presentar la trayectoria profesional, proyectos y habilidades de Sergio Andrés Aparicio.**

[🌐 Ver Demo en Vivo](https://sergioandresaparicio.github.io/portafolio/) • [📦 Ver Código](https://github.com/Sergioandresaparicio/portafolio) • [🐛 Reportar Problema](https://github.com/Sergioandresaparicio/portafolio/issues)

</div>

---

## 📖 Descripción del Proyecto

**Sergio.v95** no es un portafolio web tradicional: es una simulación visual y funcional de un entorno de escritorio clásico tipo Windows 95 construida enteramente con **tecnologías web nativas (Vanilla HTML5, CSS3 y JavaScript)**, sin dependencias externas pesadas.

El proyecto permite al reclutador o visitante interactuar con un escritorio virtual, abrir ventanas flotantes independientes, arrastrarlas, minimizarlas, maximizarlas y explorar de manera lúdica:
* **`Profile.doc`:** La historia profesional y el perfil híbrido (Biólogo, Especialista Ambiental y Desarrollador de Software).
* **`Experience.exe`:** Cronología de experiencia académica y proyectos en Campuslands.
* **`Skills.cpl`:** Panel de control de habilidades técnicas (Frontend, Backend, Bases de Datos y Herramientas).
* **`Contact.lnk`:** Enlaces directos a redes profesionales y formulario de contacto.

---

## ✨ Características Principales

* 🪟 **Sistema de Ventanas Múltiples:** Manejo de z-index dinámico, apertura simultánea, enfoque activo, minimizar, maximizar y cerrar.
* 🖱️ **Interacción de Escritorio:** Iconos interactivos con retroalimentación visual al hacer clic.
* 🎨 **Estética Retro Pixel-Perfect:** Paleta de colores, sombras biseladas clásicas (`inset` / `outset`) y tipografía estilizada.
* ⚡ **Alto Rendimiento y Cero Dependencias:** Construido 100% con Vanilla JS, sin frameworks pesados, garantizando tiempos de carga casi instantáneos.
* 📱 **Despliegue Continuo:** Publicado y disponible permanentemente a través de **GitHub Pages**.

---

## 🏗️ Arquitectura y Estructura del Código

El proyecto sigue una separación rigurosa de responsabilidades (SoC - Separation of Concerns):

```
portafolio/
│
├── index.html              # Estructura semántica del escritorio y ventanas modales
├── README.md               # Documentación técnica completa del proyecto
├── LICENSE                 # Licencia de código abierto MIT
├── .gitignore              # Exclusiones de control de versiones
│
├── css/
│   └── style.css           # Estilos visuales del sistema operativo retro (Win95 UI)
│
├── js/
│   └── script.js           # Lógica del motor de ventanas, eventos DOM y arrastre
│
└── assets/
    └── icons/              # Iconografía vectorial en formato SVG optimizado
        ├── profile.svg     # Icono de documento de perfil
        ├── experience.svg  # Icono de ejecutable de experiencia
        ├── skills.svg      # Icono de panel de habilidades
        ├── contact.svg     # Icono de acceso directo de contacto
        ├── smartcity.svg   # Iconos temáticos de proyectos
        └── start.svg       # Icono del menú Inicio
```

---

## 🚀 Instalación y Ejecución Local

Para clonar y explorar este proyecto en tu entorno local:

### Prerrequisitos
* Un navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge o Safari).
* [Git](https://git-scm.com/) instalado en tu equipo.

### Pasos de ejecución
```bash
# 1. Clonar el repositorio
git clone https://github.com/Sergioandresaparicio/portafolio.git

# 2. Navegar al directorio del proyecto
cd portafolio

# 3. Abrir en tu navegador
# En Windows (PowerShell):
Start-Process index.html

# O utilizando la extensión Live Server en VS Code:
code .
```

---

## 🔄 Flujo de Trabajo y Buenas Prácticas de Git

* **Conventional Commits:** Historial de cambios descriptivo y estandarizado con prefijos semánticos (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`).
* **Control de Versiones Semántico (SemVer):** Versionamiento estructurado (`v1.0.0`).
* **Clean Code en Frontend:** Código JavaScript modularizado por funciones, manejo de eventos desacoplado y nomenclatura clara en clases CSS (BEM modificado).

---

## 🌐 Despliegue en Producción

El frontend se encuentra desplegado y alojado en **GitHub Pages**:
🔗 **[https://sergioandresaparicio.github.io/portafolio/](https://sergioandresaparicio.github.io/portafolio/)**

---

## 📄 Licencia

Este proyecto se encuentra bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 📬 Contacto

**Sergio Andrés Aparicio Galvis**  
* 💼 LinkedIn: [sergio-andrés-aparicio-galvis](https://linkedin.com/in/sergio-andr%c3%a9s-aparicio-galvis-62b6b8213)  
* 🐙 GitHub: [@Sergioandresaparicio](https://github.com/Sergioandresaparicio)  
* 📧 Correo: [sergioapariciogalvis@gmail.com](mailto:sergioapariciogalvis@gmail.com)
