# Como subir una foto nueva

Flujo corto:

1. Copia la foto dentro de `img/`.
2. Abre `fotos.js` y añade una sola linea al final.
3. Haz doble clic en `actualizar-galeria.bat`.

Ejemplo:

```js
["piedrasErraticas.JPG", "Piedras erráticas", "Estonia", "Vista al Mar Báltico con piedras erráticas", "piedras-erraticas"],
```

Que significa:

```text
["archivo de la foto", "titulo", "lugar", "descripcion", "nombre-interno"]
```

El `nombre-interno` va en minusculas, sin espacios y con guiones. Es lo que usa
el script para crear automaticamente:

```text
img/optimized/piedras-erraticas-small.jpg
img/optimized/piedras-erraticas-large.jpg
```

No tienes que crear esas dos imagenes a mano.

## Sobre el lugar

Ahora mismo el sitio no se reconoce solo. Lo escribes en la tercera parte de la
linea, por ejemplo `"Estonia"`.

Se podria hacer mas adelante leyendo GPS de la foto si el movil guardo la
ubicacion, pero esta version no lo hace automaticamente.
