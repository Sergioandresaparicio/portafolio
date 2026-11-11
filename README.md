# 🪟 Windows XP & 95 Interactive Portfolio — Sergio Andrés Aparicio

<div align="center">

[![Demo en GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://sergioandresaparicio.github.io/portafolio/)
[![HTML5](https://img.shields.io/badge/HTML5-Semántico-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-WinXP%20%26%20Win95%20Themes-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6%2B%20Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Audio-Windows%20Sound%20FX-9cf?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Experiencia web inmersiva que recrea los entornos de escritorio clásicos de Windows XP y Windows 95, integrando juegos funcionales (Buscaminas y Solitario), efectos de audio originales, sistema de ventanas interactivo y la vitrina profesional de Sergio Andrés Aparicio.**

[🌐 Probar Portafolio en Vivo](https://sergioandresaparicio.github.io/portafolio/) • [📦 Ver Repositorio](https://github.com/Sergioandresaparicio/portafolio) • [🐛 Reportar Bug](https://github.com/Sergioandresaparicio/portafolio/issues)

</div>

---

## 📖 Descripción del Proyecto

Este portafolio trasciende los formatos convencionales para convertirse en una **aplicación web retro interactiva de alto rendimiento**. Diseñado con rigor artesanal en **Vanilla HTML5, CSS3 y JavaScript ES6+**, recrea fielmente la interfaz gráfica de usuario (GUI), animaciones, paletas y comportamiento de los sistemas operativos más icónicos de la historia informática: **Windows XP (Luna Blue)** y **Windows 95 (Classic)**.

Al iniciar, el visitante es recibido por la clásica **pantalla de inicio de sesión de Windows XP**, con selección de perfil, reproducción de efectos de sonido originales (`xp_startup`, `xp_logon`) y bienvenida interactiva antes de desbloquear el escritorio con el legendario fondo **Bliss**.

---

## ✨ Características Principales

* 🔐 **Pantalla de Inicio de Sesión Windows XP:** Flujo interactivo de bienvenida con selector de usuario, avatar oficial y audio de inicio de sesión.
* 🎨 **Soporte Multi-Tema en Caliente:** Conmutación dinámica entre el estilo **Windows XP (Luna)** y **Windows 95 (Classic Teal)**.
* 🔊 **Motor de Audio Integrado:** Efectos sonoros auténticos (`startup`, `logon`, `click`, `error`, `balloon`, `shutdown`) reproducidos de forma asíncrona mediante HTML5 Audio.
* 💣 **Juego Buscaminas Funcional (Minesweeper):** Implementación completa del algoritmo clásico de generación de minas, detección de casillas vacías adyacentes (flood fill), contador de banderas y temporizador.
* 🃏 **Juego Solitario Clásico (Solitaire):** Motor de cartas con mecánicas de arrastre y soltado (Drag & Drop), ordenamiento de palos y victoria animada.
* 🪟 **Administrador de Ventanas Avanzado:**
  * Arrastre libre por la barra de título (drag & drop con cálculo de coordenadas del puntero).
  * Manejo dinámico de foco y orden de apilamiento (`z-index`).
  * Botones operativos de minimizar, maximizar y cerrar con actualización de la barra de tareas.
* 📁 **Ventanas del Sistema Integradas:**
  * **`Profile.doc`:** Biografía y perfil híbrido (Biólogo, Especialista Ambiental y Desarrollador Fullstack/Backend).
  * **`Experience.exe`:** Cronología de proyectos en Campuslands y experiencia práctica.
  * **`Skills.cpl`:** Panel de control de tecnologías y herramientas dominadas.
  * **`Contact.lnk`:** Formulario interactivo y enlaces a LinkedIn y GitHub.

---

## 🏗️ Arquitectura y Estructura del Proyecto

El código está estructurado modularmente para desacoplar el motor de ventanas, los juegos y los estilos temáticos:

```text
portafolio/
├── index.html                  # Estructura semántica del sistema operativo (Login, Desktop, Taskbar)
├── README.md                   # Documentación técnica completa
├── LICENSE                     # Licencia de código abierto MIT
├── .gitignore                  # Reglas de exclusión de Git
│
├── css/
│   ├── style.css               # Estilos principales de la GUI, ventanas XP y tema Win95
│   ├── minesweeper.css         # Estilos específicos del juego Buscaminas
│   └── solitaire.css           # Estilos de cartas, tapete y animaciones de Solitario
│
├── js/
│   ├── script.js               # Motor principal: ventanas, menú inicio, audio, barra de tareas
│   ├── minesweeper.js          # Lógica completa del juego Buscaminas
│   └── solitaire.js            # Lógica y motor de reglas del juego Solitario
│
└── assets/
    ├── profile.jpg             # Fotografía profesional de perfil
    ├── audio/                  # Efectos de sonido originales (win95, xp_startup, click, etc.)
    ├── wallpaper/              # Fondo clásico Bliss de alta resolución
    └── icons/                  # Iconografía SVG vectorial
        ├── retro/              # Iconos de tecnologías (Python, Java, Docker, n8n, etc.)
        └── xp/                 # Iconos del sistema Windows XP (Bandera, Apagar, Usuario, etc.)
```

---

## 🚀 Instalación y Ejecución Local

### Demo en Producción
Disponible de forma continua en **GitHub Pages**:  
👉 **[https://sergioandresaparicio.github.io/portafolio/](https://sergioandresaparicio.github.io/portafolio/)**

### Despliegue Local
```bash
# 1. Clonar el repositorio
git clone https://github.com/Sergioandresaparicio/portafolio.git

# 2. Navegar a la carpeta
cd portafolio

# 3. Abrir index.html en el navegador
# En Windows (PowerShell):
Start-Process index.html

# O ejecutando Live Server en VS Code:
code .
```

---

## 🔄 Flujo de Trabajo Git & Conventional Commits

* `feat(portfolio): ✨ migrar portafolio interactivo a Windows XP/95 con Buscaminas, Solitario y audio`
* `docs(readme): 📚 documentar arquitectura del sistema, soporte multi-tema y demo Pages`
* `style(xp): 🎨 afinar estilos de pantalla de inicio de sesión y barra de tareas Luna`
* `fix(audio): 🐛 optimizar precarga de efectos de sonido para evitar bloqueos de autoplay`

Gestionado bajo el modelo **Gitflow** con ramas `main`, `develop` y `gh-pages`, junto al tag de lanzamiento mayor (**SemVer**) `v2.0.0`.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT** — consulta el archivo [LICENSE](LICENSE) para más información.

---

## 👨‍💻 Autor

**Sergio Andrés Aparicio Galvis**  
* 💼 LinkedIn: [sergio-andrés-aparicio-galvis](https://linkedin.com/in/sergio-andr%c3%a9s-aparicio-galvis-62b6b8213)  
* 🐙 GitHub: [@Sergioandresaparicio](https://github.com/Sergioandresaparicio)  
* 📧 Correo: [sergioapariciogalvis@gmail.com](mailto:sergioapariciogalvis@gmail.com)
