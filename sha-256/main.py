import sys
from Crypto.Hash import SHA256

blocks = [] # Variável que guardará a lista de blocos

# Função do algoritmo SHA-265
def digest(data):
    h = SHA256.new()
    h.update(data)
    return h.digest()


# Leitura do arquivo e quebra em blocos de 1024 bytes. Saída na lista "blocks".
with open(sys.argv[1], "rb") as f:
    byte = f.read(1024)
    while byte:
        blocks.append(byte)
        byte = f.read(1024)


# Separa o ultimo bloco e calcula seu respectivo hash
block = blocks.pop()
hash = digest(block)

# Itera sobre os blocos restantes, calculando o hash de cada bloco com o hash anterior.
for b in reversed(blocks) :
    blockhash = bytearray(len(b) + len(hash))
    blockhash = b + hash
    
    hash = digest(blockhash)
    

# Imprime o hash do primeiro bloco.
print(hash.hex())