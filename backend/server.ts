import express from 'express'
import cors from 'cors'
import multer from 'multer'
import csvToJson from 'convert-csv-to-json'

const app = express()
const port = 3000

const storage = multer.memoryStorage()
const upload = multer({ storage })

let userData: Array<Record<string, string>> = []

app.use(cors())

app.post('/api/files', upload.single('file'), async(req, res) => {
    // 1. Extraer el archivo de la solicitud
    const { file } = req
    // 2. Validar que haya un archivo
    if (!file) {
        return res.status(500).json({ message: 'El archivo es requerido' })
    }
    // 3. Validar el tipo de archivo (CSV)
    if (file.mimetype !== 'text/csv') {
        return res.status(500).json({ message: 'El archivo debe ser CSV' })
    }
    let json: Array<Record<string, string>> = []
    // 4. Transformar el archivo (buffer) a String
    try {
        const rawCsv = Buffer.from(file.buffer).toString('utf-8')
        console.log(rawCsv)
        // 5. Transformar el String (csv) a JSON
        json = csvToJson.csvStringToJson(rawCsv)
    } catch (error) {
        return res.status(500).json({ message: 'Error al analizar el archivo' })
    }
    
    // 6. Guardar el JSON en la base de datos (o en memoria)
    userData = json
    // 7. Retornar 200 con el mensaje y el JSON
    return res.status(200).json({ data: json, message: 'El archivo de cargo correctamente.' })
})

app.get('/api/files', async(req, res) => {
    // 1. Extraer el parametro de consulta 'q' de la solicitud
    const { q } = req.query
    // 2. Validar que esta el parametro de consulta
    if (!q) {
        return res.status(500).json({ message: 'El parametro de consulta es requerido' })
    }

    if (Array.isArray(q)) {
        return res.status(500).json({ message: 'El parametro de consulta "q" debe ser una cadena' })
    }

    // 3. Filtrar los datos de la base de datos (o memoria) con el parametro de consulta
    const search = q.toString().toLowerCase()

    const filterData = userData.filter(row => {
        return Object
        .values(row)
        .some(value => value.toLowerCase().includes(search))
    })
    // 4. Retornar 200 con los datos filtrados
    return res.status(200).json({ data: filterData })
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})