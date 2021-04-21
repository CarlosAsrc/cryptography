const yargs = require('yargs');
const FileUtils = require('./file-utils');
const CoincidenceIndexService = require('./coincidence-index-service');
const {alphabet, englishCoincidenceIndex, englishMostFrequentLetter} = require('./constants');

yargs.command(
    {
        command: 'decrypt',
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
                decrypt(FileUtils.load(argv.file).toLowerCase().split(/\s/).join(''), argv.file)    
            } else if(argv.cipher){
                decrypt(argv.cipher.toLowerCase().split(/\s/).join(''), 'texto-direto.txt')
            }
        }
    }
)



const decrypt = (cipherText, file) => {
    let output = ''
    const keySize = calculatekeySize(cipherText);
    const key = discoverKey(cipherText, keySize);
    const clearText = getClearText(cipherText, key);
    

    console.log('Key Size: ' + keySize)
    console.log('Key: ' + key)
    console.log('Clear text: \n' + clearText)

    output += 'Key Size: ' + keySize
    output += '\n'+'Key: ' + key
    output += '\n'+'Clear text: \n' + clearText

    FileUtils.write(file, output)
}


const calculatekeySize = (cipherText) => {

    let table = []
    let line = []
    let cipher = ''

    for (var i = 1; i <= 20; i++) {
        for (var j = 1; j <= i; j++) {
            cipher = ''
            for (var k = j-1; k < cipherText.length; k+=i) {
                cipher += cipherText.charAt(k)
            }
            line.push({ cipher: cipher, index: CoincidenceIndexService.calculateCoincidenceIndex(cipher) })   
        }
        table.push([...line])
        line = []
    }
    

    let closest = 1, keySize = Number.MAX_VALUE, indexDistance = 0

    for(var [i, v] of table.entries()) {
        for(var index in v ) {
            indexDistance = Math.abs(englishCoincidenceIndex - v[index].index)
            indexDistance < closest ? (
                keySize = i, closest = indexDistance
            ) : null
        }
    }

    return keySize+1
}


const discoverKey = (cipherText, keySize) => {
    let column = '', swapCiphers = [], key = '', mostFrequentLetter

    for(var i=0; i<keySize; i++) {
        for(var j=i; j<=cipherText.length; j+=keySize) {
            column += cipherText.charAt(j)
        }
        swapCiphers[i] = column
        column = ''
    }

    for(let cipher in swapCiphers) {
        lettersOccurrences = CoincidenceIndexService.calculateFrequencyOccurrences(swapCiphers[cipher])
        mostFrequentLetter = Object.keys(lettersOccurrences).reduce(function(a, b){ return lettersOccurrences[a] > lettersOccurrences[b] ? a : b });
        key += alphabet.charAt( Math.abs(alphabet.indexOf(mostFrequentLetter) - alphabet.indexOf(englishMostFrequentLetter)) )
    }

    return key
}


const getClearText = (cipherText, key) => {
    let clearText = '', j = 0, cipherLetterIndex = 0, keyLetterIndex = 0, clearTextLetterIndex = 0
    for(let i=0; i< cipherText.length; i++) {
        cipherLetterIndex = alphabet.indexOf(cipherText.charAt(i))
        keyLetterIndex = alphabet.indexOf(key.charAt(j))
        clearTextLetterIndex = Math.abs( cipherLetterIndex - keyLetterIndex )
        clearTextLetterIndex = keyLetterIndex > cipherLetterIndex ? Math.abs(alphabet.length - keyLetterIndex + cipherLetterIndex) : Math.abs(keyLetterIndex - cipherLetterIndex)
        
        clearText += alphabet.charAt(clearTextLetterIndex)
        
        j++
        if(j == key.length) {
            j = 0    
        }
    }
    return clearText
}



yargs.parse()