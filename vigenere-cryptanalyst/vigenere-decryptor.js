#!/usr/bin/env node
const yargs = require('yargs');
const readline = require('readline-sync')
const chalk = require('chalk')

const FileUtils = require('./file-utils');
const CoincidenceIndexService = require('./coincidence-index-service');
const {alphabet, englishCoincidenceIndex, englishMostFrequentLetter, portugueseCoincidenceIndex, portugueseMostFrequentLetter} = require('./constants');

// Direciona argumentos de entrada para execução do algoritmo:
yargs.command(
    {
        command: 'decrypt',
        describe: 'Decifrar uma Cifra de Vigenère',
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
            },
            language: {
                describe: 'Língua do texto claro (suportados: en, pt)',
                demandOption: true,
                type: 'string'
            },
        },
        handler(argv) {
            if(argv.language == 'pt') {
                languageCoincidenceIndex = portugueseCoincidenceIndex
                languageMostFrequentLetter = portugueseMostFrequentLetter
            } else if (argv.language == 'en') {
                languageCoincidenceIndex = englishCoincidenceIndex
                languageMostFrequentLetter = englishMostFrequentLetter
            }
            if(argv.file) {
                decrypt(FileUtils.load(argv.file).toLowerCase().split(/\s/).join(''), argv.file)    
            } else if(argv.cipher){
                decrypt(argv.cipher.toLowerCase().split(/\s/).join(''), 'texto-direto.txt')
            }
        }
    }
)

let languageCoincidenceIndex
let languageMostFrequentLetter

// Função principal da aplicação (interação com usuário pelo terminal e chamadas das funções principais do algoritmo):
const decrypt = (cipherText, file) => {
    let output = '', key ='', clearText=''
    const possibleKeys = discoverPossibleKeys(cipherText, calculatekeySize(cipherText));

    while(true) {
        key = readline.question(
                          chalk.red.bold('\n---Decriptador de Cifras de Vegenère---') +
                          '\n(para sair: ctrl + c)' +
                          '\nChave mais provável                     : '+ chalk.green.bold(possibleKeys.bestKeyCandidate) + 
                          '\nCaracteres substitutos para cada posição: ' + chalk.green.bold(possibleKeys.keyCharactersAlternatives)+
                          '\nTentar chave:')
        clearText = getClearText(cipherText, key);
        console.log('Texto claro: \n' + clearText)
        console.log('Tamanho da chave: ' + key.length)
        console.log('Chave: ' + key)
        output = ''
        output += 'Tamanho da chave: ' + key.length
        output += '\nChave: ' + key
        output += '\nTexto claro: \n' + clearText
        FileUtils.write(file, output)
        console.log('\nTexto gravado em '+'./clear-text/'+file+'.clear')
    }
}

// Calcula o tamanho da chave dado uma cifra qualquer:
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
            indexDistance = Math.abs(languageCoincidenceIndex - v[index].index)
            indexDistance < closest ? (
                keySize = i, closest = indexDistance
            ) : null
        }
    }

    return keySize+1
}


// Busca chave mais provável, e possíveis caracteres alternativos para cada posição da chave:
// Retorna: {provável-chave, caracteres-alternativos}
const discoverPossibleKeys = (cipherText, keySize) => {
    let column = '',
        swapCiphers = [],
        keyAlphaet = [],
        bestKeyCandidate = '',
        keyCharactersAlternatives = ''
        

    for(var i=0; i<keySize; i++) {
        for(var j=i; j<=cipherText.length; j+=keySize) {
            column += cipherText.charAt(j)
        }
        swapCiphers[i] = column
        column = ''
    }

    for(let cipher in swapCiphers) {
        lettersOccurrences = CoincidenceIndexService.calculateFrequencyOccurrences(swapCiphers[cipher])
        orderedLettersOccurrences = getOrderedLettersOccurrences(lettersOccurrences)

        bestKeyCandidate += alphabet.charAt( Math.abs(alphabet.indexOf(orderedLettersOccurrences[0].letter) - alphabet.indexOf(languageMostFrequentLetter)) )
        keyCharactersAlternatives += alphabet.charAt( Math.abs(alphabet.indexOf(orderedLettersOccurrences[1].letter) - alphabet.indexOf(languageMostFrequentLetter)) )
            
    }

    return {bestKeyCandidate: bestKeyCandidate, keyCharactersAlternatives: keyCharactersAlternatives}
}



// Retorna o texto claro, dado um texto cifrado e a chave:
const getClearText = (cipherText, key) => {
    let clearText = '', j = 0, cipherLetterIndex = 0, keyLetterIndex = 0, clearTextLetterIndex = 0
    for(let i=0; i< cipherText.length; i++) {
        cipherLetterIndex = alphabet.indexOf(cipherText.charAt(i))
        keyLetterIndex = alphabet.indexOf(key.charAt(j))
        clearTextLetterIndex = keyLetterIndex > cipherLetterIndex ? Math.abs(alphabet.length - keyLetterIndex + cipherLetterIndex) : Math.abs(keyLetterIndex - cipherLetterIndex)
        
        clearText += alphabet.charAt(clearTextLetterIndex)
        
        j++
        if(j == key.length) {
            j = 0    
        }
    }
    return clearText
}



// Retorna uma lista ordenada descresente sobre as frequências de cada letra:
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



yargs.parse()