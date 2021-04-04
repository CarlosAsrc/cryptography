const yargs = require('yargs');
const fs = require('fs');
const { Cipher } = require('crypto');

yargs.command(
    {
        command: 'decipher',
        describe: 'Add new note',
        builder: {
            cipher: {
                describe: 'Texto cifrado',
                demandOption: false,
                type: 'string'
            },
            file: {
                describe: 'Arquivo com texto cifrado',
                demandOption: false,
                type: 'string'
            }
        },
        handler(argv) {
            if(argv.file) {
                decipher(load(argv.file).toLowerCase().split(/\s/).join(''))    
            } else if(argv.cipher){
                decipher(argv.cipher.toLowerCase().split(/\s/).join(''))
            }
        }
    }
)


const alphabet = 'abcdefghijklmnopqrstuvwxyz'
const portugueseCoincidenceIndex = 0.072723
const englishCoincidenceIndex = 0.065


const decipher = (cipherText) => {
    const keySize = calculatekeySize(cipherText);
    const key = discoverKey(cipherText, keySize);

    console.log(keySize)
    console.log(key)
}


const calculatekeySize = (cipherText) => {

    let table = []
    let line = []
    let cipher = ''

    for (var i = 1; i <= 7; i++) {
        for (var j = 1; j <= i; j++) {
            cipher = ''
            for (var k = j-1; k < cipherText.length; k+=i) {
                cipher += cipherText.charAt(k)
            }
            line.push({ cipher: cipher, index: calculateCoincidenceIndex(cipher) })   
        }
        table.push([...line])
        line = []
    }
    

    let closest = 1, keySize = Number.MAX_VALUE, indexDistance = 0

    for(var [i, v] of table.entries()) {
        for(var index in v ) {
            indexDistance = Math.abs(portugueseCoincidenceIndex - v[index].index)
            indexDistance < closest ? (
                keySize = i, closest = indexDistance
            ) : null
        }
    }

    return keySize+1
}


const discoverKey = (cipherText, keySize) => {
    let swapCiphers = []
    let column = ''
    for(var i=0; i<keySize; i++) {
        for(var j=i; j<=cipherText.length; j+=keySize) {
            column += cipherText.charAt(j)
        }
        swapCiphers[i] = column
        column = ''
    }

    for(let cipher in swapCiphers) {
        lettersOccurrences = calculateFrequencyOccurrences(swapCiphers[cipher])
        let mostFrequentLetter = Object.keys(lettersOccurrences).reduce(function(a, b){ return lettersOccurrences[a] > lettersOccurrences[b] ? a : b });
        
    }
}



const calculateCoincidenceIndex = (cipher) => {
    lettersOccurrences =  calculateFrequencyOccurrences(cipher)
    let size = 0
    for (let key in lettersOccurrences) 
        size += lettersOccurrences[key]


    let index = 0
    
    for (let key in lettersOccurrences) {
        index += ( (lettersOccurrences[key] * (lettersOccurrences[key]-1) )  /  (size*(size-1)) )
    }

    return index
}

const calculateFrequencyOccurrences = (cipher) => {
    let lettersOccurrences = {}
    
    for (var i = 0; i < alphabet.length; i++) {
        lettersOccurrences[alphabet.charAt(i)] = (cipher.match(new RegExp(alphabet.charAt(i), "g")) || [] ).length
    }

    // for (let key in lettersOccurrences)
    //     console.log(key + ': ' + lettersOccurrences[key]);

    return lettersOccurrences
}









const load = (fileName) => {
    try {
        return fs.readFileSync('./cifras/'+fileName, 'utf8')
    } catch (e) {
        return []
    }
}


yargs.parse()