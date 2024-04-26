const http = require('http')
const fs = require('fs')

// Creamos una función asíncrona para recoger los datos del fichero pokedex.json
const fetchPokemonData = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./pokedex.json", "utf-8", (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(JSON.parse(data))
            }
        })
    })
}

// Creamos una función para manejar los datos recogidos en fetchPokemonData, según la solicitud
const handleRequest = async (req, res) =>{
    const pokemonsData = await fetchPokemonData()

    const pokemonID = parseInt(decodeURI(req.url.substring(1)), 10)
    const pokemonRequest = pokemonsData.find(pokemon => pokemon.id === pokemonID)

    if (pokemonRequest) {
        const response = {
            "id" : pokemonRequest.id,
            "name english" : pokemonRequest.name.english,
            "name japanese" : pokemonRequest.name.japanese,
            "name chinese" : pokemonRequest.name.chinese,
            "name french" : pokemonRequest.name.french,
        }
        res.writeHead(200, {"Content-Type" : "application/json"} )
        res.end(JSON.stringify(response, null, 4))
    } else {
        res.writeHead(404, {"Content-Type" : "text/plain"})
        res.end("Damn! That Pokemon is not in the DB!")
    }
}

const server = http.createServer(handleRequest)

server.listen(3000, () => { console.log( "Listening to port 3000")} )