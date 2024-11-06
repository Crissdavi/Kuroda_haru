const axios = require('axios');
const fs = require('fs');

async function downloadAnimesByLanguage(query, language) {
    try {
        // Realiza la búsqueda de animes
        let { data } = await axios.get(`https://deliriussapi-oficial.vercel.app/anime/animesearch?query=${encodeURIComponent(query)}`);
        let animes = data.data;

        // Filtra los animes por idioma
        let filteredAnimes = animes.filter(anime => anime.payload.language === language);

        // Si no hay animes en el idioma especificado
        if (filteredAnimes.length === 0) {
            console.log(`No se encontraron animes en el idioma: ${language}`);
            return;
        }

        // Crear un archivo para guardar la información
        const fileName = `${query.replace(/\s+/g, '_')}_animes_${language}.txt`;
        let content = 'Lista de Animes:\n\n';

        filteredAnimes.forEach(anime => {
            content += `Título: ${anime.name}\n`;
            content += `Tipo: ${anime.payload.media_type}\n`;
            content += `Año de inicio: ${anime.payload.start_year}\n`;
            content += `Emitido: ${anime.payload.aired}\n`;
            content += `Puntuación: ${anime.payload.score}\n`;
            content += `Estado: ${anime.payload.status}\n`;
            content += `Vistas: ${anime.views}\n`;
            content += `URL: ${anime.url}\n`;
            content += '--------------------------\n';
        });

        // Escribir el contenido en un archivo
        fs.writeFileSync(fileName, content, 'utf8');
        console.log(`Información de animes guardada en ${fileName}`);
        
    } catch (error) {
        console.error('Error al buscar o guardar los animes:', error);
    }
}

// Definición del handler
const handler = {
    command: ['animedl'], 
    async handlerFunction(m, args) {
        const query = args[0]; // Asume que el primer argumento es el nombre del anime
        const language = args[1] || 'es'; // Si no se especifica, se usa 'es' como idioma por defecto
        await downloadAnimesByLanguage(query, language);
    }
};


export default handler;
handler.command = ['animedl'];
