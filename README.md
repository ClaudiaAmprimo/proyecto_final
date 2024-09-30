## Descripción

Travel Hub es una aplicación desarrollada en **Angular**, que permite gestionar viajes y eventos asociados, incluyendo funcionalidades de distribución de gastos entre los participantes, itinerario de viajes, calendario y mapa.

Se comunica con un backend, que es necesario para obtener los datos que se mostrarán en la interfaz.

> **Nota:** Para que el frontend funcione correctamente, es imprescindible que el backend esté en ejecución.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu sistema:

- [Node.js](https://nodejs.org/en/) (versión recomendada: v14 o superior)
- [npm](https://www.npmjs.com/) (se instala automáticamente con Node.js)
- [Angular CLI](https://angular.io/cli) (versión recomendada: v14 o superior)

### Verificar Instalaciones

  Abre una terminal y ejecuta los siguientes comandos para verificar que están instalados correctamente:

  1. **Node.js y npm**

    node -v
    npm -v

  Si no tienes Node.js y npm instalados, descárgalos e instálalos desde aquí: https://nodejs.org/en/

  2. **Angular CLI**

  Verifica si tienes instalado Angular CLI ejecutando el siguiente comando:

    ng version

  Si el comando no es reconocido, puedes instalar Angular CLI globalmente con:

    npm install -g @angular/cli

  3. **Clonar el Repositorio**
    Para clonar este repositorio en tu máquina local, ejecuta el siguiente comando en tu terminal:

    git clone https://github.com/ClaudiaAmprimo/proyecto_final.git

  4. **Instalar Dependencias**

    Una vez clonado el repositorio, navega al directorio del proyecto y ejecuta el siguiente comando para instalar las dependencias necesarias:

    cd proyecto_final
    npm install


### Ejecución del Proyecto

**Para ejecutar el proyecto en modo de desarrollo, usa el siguiente comando:**

    ng serve -o

Esto abrirá automáticamente la aplicación en tu navegador predeterminado.

**Notas adicionales**
Asegúrate de tener el backend corriendo antes de iniciar el frontend para poder ver los datos correctamente.
Puedes ajustar las configuraciones del servidor de desarrollo en el archivo angular.json si es necesario.
