const http = require('http');
const fs = require('fs');
const figlet = require('figlet');
const EventEmitter = require('events');

// Creamos una instancia de EventEmitter
const eventEmitter = new EventEmitter();

// Función para generar texto de bienvenida con figlet
const indexText = () => {
    return new Promise((resolve, reject) => {
        figlet('Welcome to PokeServer!', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

// Función para leer el archivo pokedex.json y emitir un evento con los datos
const readPokedexFile = () => {
    fs.readFile("./pokedex.json", "utf-8", (err, data) => {
        if (err) {
            console.error('Error al leer el archivo pokedex.json:', err);
            eventEmitter.emit('error', err);
        } else {
            eventEmitter.emit('pokedexData', JSON.parse(data));
        }
    });
};

// Creamos un oyente para el evento 'pokedexData'
eventEmitter.on('pokedexData', (pokemonsData) => {
    const server = http.createServer((req, res) => {
        // Verificamos si la solicitud es para la raíz del servidor
        if (req.url === '/' || req.url === '') {
            // Respondemos con texto generado por figlet
            res.writeHead(200, { "Content-Type": "text/plain" });
            indexText()
                .then((welcomeText) => {
                    res.end(welcomeText);
                })
                .catch((err) => {
                    console.error('Error al generar el texto de bienvenida:', err);
                    res.end("Error al generar el texto de bienvenida");
                });
            return;
        }

        // Si la solicitud no es para la raíz, procedemos a manejarla como antes
        const urlSegment = decodeURI(req.url.substring(1)).toLowerCase();
        let pokemonRequest = null;

        // Verificamos si la URL corresponde a un ID numérico
        if (!isNaN(parseInt(urlSegment))) {
            const pokemonID = parseInt(urlSegment);
            pokemonRequest = pokemonsData.find(pokemon => pokemon.id === pokemonID);
            if (!pokemonRequest) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("No hay un Pokemon con ese ID");
                return;
            }
        } else {
            // Si no es un ID numérico, buscamos por nombre
            pokemonRequest = pokemonsData.find(pokemon =>
                pokemon.name.english.toLowerCase() === urlSegment ||
                pokemon.name.japanese.toLowerCase() === urlSegment ||
                pokemon.name.chinese.toLowerCase() === urlSegment ||
                pokemon.name.french.toLowerCase() === urlSegment
            );
            if (!pokemonRequest) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("No hay un Pokemon con ese nombre");
                return;
            }
        }

        // Si se encuentra, se devuelve la información
        const response = {
            "ID": pokemonRequest.id,
            "name english": pokemonRequest.name.english,
            "name japanese": pokemonRequest.name.japanese,
            "name chinese": pokemonRequest.name.chinese,
            "name french": pokemonRequest.name.french,
            "Type": pokemonRequest.type.join(", "), // Convertimos el array de tipo a una cadena separada por comas
            "HP": pokemonRequest.base.HP,
            "Attack": pokemonRequest.base.Attack,
            "Defense": pokemonRequest.base.Defense,
            "Sp. Attack": pokemonRequest.base["Sp. Attack"], // Como la propiedad contiene un espacio, se accede con corchetes
            "Sp. Defense": pokemonRequest.base["Sp. Defense"], // Igualmente aquí
            "Speed": pokemonRequest.base.Speed
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response, null, 4));
    });

    server.listen(3000, () => { console.log("Escuchando en el puerto 3000") });
});

// Creamos un oyente para el evento 'error'
eventEmitter.on('error', (err) => {
    console.error('Error al leer el archivo pokedex.json:', err);
});

// Llamamos a la función para leer el archivo pokedex.json
readPokedexFile();
