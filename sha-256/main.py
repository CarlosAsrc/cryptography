import sys
from Crypto.Hash import SHA256

blocks = [] # Variável que guardará a lista de blocos

# Função do algoritmo SHA-265 utilizando a lib PyCrypto
# Entrada: Conteúdo binário de um bloco ou bloco+hash
# Saída: hash da entrada em formato binário
def digest(data):
    h = SHA256.new()
    h.update(data)
    return h.digest()


# Leitura do arquivo e quebra em blocos de 1024 bytes. Saída na lista "blocks".
# Saída na lista "blocks".
with open(sys.argv[1], "rb") as f:
    byte = f.read(1024)
    while byte:
        blocks.append(byte)
        byte = f.read(1024)


# Separa o ultimo bloco em "block" e calcula seu respectivo hash em "hash"
block = blocks.pop()
hash = digest(block)

# Itera sobre os blocos restantes, do penúltimo ao primeiro, calculando o hash de cada bloco com o hash do bloco anterior.
for b in reversed(blocks) :
    blockhash = b + hash # Concatena conteúdo do bloco com o hash do bloco anterior.
    hash = digest(blockhash) # Executa a função hash do SHA-256 para encriptação do bloco com o hash do bloco anterior.

# Imprime o hash do primeiro bloco.
print(hash.hex())