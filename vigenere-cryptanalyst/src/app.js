const yargs = require('yargs');
const fs = require('fs');

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
const portuguesMostFrequentLetter = 'a'


const decipher = (cipherText) => {
    const keySize = calculatekeySize(cipherText)
    const possibleKeys = discoverPossibleKeys(cipherText, keySize)
    const key = getMostLikelyKey(cipherText, possibleKeys)
    //const clearText = getClearText(cipherText, key);
    

    console.log('Key Size: ' + keySize)
    console.log('Key: ' + key)
    //console.log('Clear text: \n' + clearText)
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


const getMostLikelyKey = (cipherText, possibleKeys) => {
    let clearTextsCoincidenceIndex = []
    for(key in possibleKeys) {
        clearTextsCoincidenceIndex.push({key: possibleKeys[key], coincidenceIndex: calculateCoincidenceIndex(getClearText(cipherText, possibleKeys[key])), text: getClearText(cipherText, possibleKeys[key])})
    }
    console.log(clearTextsCoincidenceIndex)
    
}





const discoverPossibleKeys = (cipherText, keySize) => {
    let column = '',
        swapCiphers = [],
        key = '',
        mostFrequentLetter,
        keyAlphaet = []

    for(var i=0; i<keySize; i++) {
        for(var j=i; j<=cipherText.length; j+=keySize) {
            column += cipherText.charAt(j)
        }
        swapCiphers[i] = column
        column = ''
    }

    for(let cipher in swapCiphers) {
        lettersOccurrences = calculateFrequencyOccurrences(swapCiphers[cipher])
        orderedLettersOccurrences = getOrderedLettersOccurrences(lettersOccurrences)

        keyAlphaet.push([
            orderedLettersOccurrences[0].letter,
            orderedLettersOccurrences[1].letter,
            orderedLettersOccurrences[2].letter
        ])
        //key += alphabet.charAt( Math.abs(alphabet.indexOf(mostFrequentLetter) - alphabet.indexOf(portuguesMostFrequentLetter)) )
        
        //console.log(swapCiphers[cipher] + '\nletra mais frequente: '+mostFrequentLetter + '\nfrequencia: '+ lettersOccurrences[mostFrequentLetter] + '\nchave: '+key)
        //console.log(orderedLettersOccurrences)
    }

    //console.log(keyAlphaet)
    return generatePossibleKeys(keyAlphaet)
}


const generatePossibleKeys = (keyAlphaet) => {
    let possibleKeys = [], keyPositionsIndex = 0, keyPositionIndex = 0, keyPositions = []

    for(let i = 0; i < Math.pow(keyAlphaet.length, 3); i++) {
        keyPositionIndex++
        if(keyPositionIndex > 2) {keyPositionIndex = 0, keyPositionsIndex++}
        if(keyPositionsIndex > 13) {keyPositionsIndex = 0}
    }
    return ['qeyrsqemiynsqe', 'meunomemeunome', 'asibcasasibcms']
}


const getOrderedLettersOccurrences = (lettersOccurrences) => {
    orderedLettersOccurrences = []
    Object.keys(lettersOccurrences).forEach(
        function(a){ orderedLettersOccurrences.push({letter: a, frequency: lettersOccurrences[a]}) }
    )
    orderedLettersOccurrences = orderedLettersOccurrences.sort(
        function(a, b){
            return a.frequency > b.frequency ? -1 : 1
        }
    )
    return orderedLettersOccurrences
}

const getClearText = (cipherText, key) => {
    let clearText = '', j = 0, cipherLetterIndex = 0, keyLetterIndex = 0, clearTextLetterIndex = 0
    for(let i=0; i< cipherText.length; i++) {
        cipherLetterIndex = alphabet.indexOf(cipherText.charAt(i))
        keyLetterIndex = alphabet.indexOf(key.charAt(j))
        clearTextLetterIndex = Math.abs( cipherLetterIndex - keyLetterIndex )
        clearTextLetterIndex = keyLetterIndex > cipherLetterIndex ? Math.abs(26 - keyLetterIndex + cipherLetterIndex) : Math.abs(keyLetterIndex - cipherLetterIndex)
        
        clearText += alphabet.charAt(clearTextLetterIndex)
        
        j++
        if(j == key.length) {
            j = 0    
        }
    }
    return clearText
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