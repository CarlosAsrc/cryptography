# Vigenère Cipher Decryptor

## Running

### Command use:

Build the project:

`npm install`

To decrypt a cipher on file:

`node vigenere-decryptor.js decrypt --file=file-name --language=language`

To decrypt a cipher directly:

`node vigenere-decryptor.js decrypt --cipher="cipher" --language=language`

### Arguments summary:

 - --cipher:    Cipher text

 - --file:      File with the cipher

 - --language:  Clear text language (allowed: en, pt)

  Examples:
    
    node vigenere-decryptor.js decrypt --file=en.txt --language=en
    node vigenere-decryptor.js decrypt --file=pt.txt --language=pt
    node vigenere-decryptor.js decrypt --cipher="flcfsnsaocfta" --language=en


## Inputs

For input files, the file needs to be in the following directory:

./ciphers/

## Outputs
The result of decryption will be available in 

./clear-text/