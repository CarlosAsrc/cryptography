const fs = require('fs')


const load = (fileName) => {
    try {
        return fs.readFileSync('./ciphers/'+fileName, 'utf8')
    } catch (e) {
        return []
    }
}


const write = (fileName, text) => {
    try {
        fs.mkdirSync('./clear-text', { recursive: true })
        fs.writeFileSync('./clear-text/'+fileName+'.clear', text)
    } catch (e) {
        return []
    }
}

module.exports = {
    load: load,
    write: write
}