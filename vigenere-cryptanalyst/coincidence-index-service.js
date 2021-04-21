
const {alphabet} = require('./constants');

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


module.exports = {
    calculateCoincidenceIndex: calculateCoincidenceIndex,
    calculateFrequencyOccurrences: calculateFrequencyOccurrences
}