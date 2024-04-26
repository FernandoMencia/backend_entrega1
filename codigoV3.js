const http = require('http');
const fs = require('fs');

// Creamos una función asíncrona para recoger los datos del fichero pokedex.json
const fetchPokemonData = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./pokedex.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

// Función para generar texto de bienvenida
const indexText = () => {
    return "Wellcome to PokeServer!";
};

// Creamos una función para manejar las solicitudes
const handleRequest = async (req, res) => {
    // Verificamos si la solicitud es para la raíz del servidor
    if (req.url === '/' || req.url === '') {
        // Respondemos con texto Lorem Ipsum
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(indexText());
        return;
    }

    // Si la solicitud no es para la raíz, procedemos a manejarla como antes
    const pokemonsData = await fetchPokemonData();

    const urlSegment = decodeURI(req.url.substring(1)).toLowerCase();

    let pokemonRequest = null;

    // Primero probamos por ID
    if (!isNaN(parseInt(urlSegment))) {
        const pokemonID = parseInt(urlSegment);
        pokemonRequest = pokemonsData.find(pokemon => pokemon.id === pokemonID);
    }

    // Si no se encuentra por ID, se intenta por nombre
    if (!pokemonRequest) {
        pokemonRequest = pokemonsData.find(pokemon =>
            pokemon.name.english.toLowerCase() === urlSegment ||
            pokemon.name.japanese.toLowerCase() === urlSegment ||
            pokemon.name.chinese.toLowerCase() === urlSegment ||
            pokemon.name.french.toLowerCase() === urlSegment
        );
    }

    // Si se encuentra, se devuelve la información, si no se da mensaje de error
    if (pokemonRequest) {
        const response = {
            "ID": pokemonRequest.id,
            "name english": pokemonRequest.name.english,
            "name japanese" : pokemonRequest.name.japanese,
            "name chinese" : pokemonRequest.name.chinese,
            "name french" : pokemonRequest.name.french,
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
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("El pokemon no está en la BD");
    }
};

const server = http.createServer(handleRequest);

server.listen(3000, () => { console.log("Escuchando en el puerto 3000") });
