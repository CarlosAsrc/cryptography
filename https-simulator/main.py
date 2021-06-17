import random
import sys, os
from typing import Generator
from Crypto.Hash import SHA256
from Crypto.Cipher import AES
from Crypto import Random
from random import seed
from random import randint

phex = 'B10B8F96A080E01DDE92DE5EAE5D54EC52C99FBCFB06A3C69A6A9DCA52D23B616073E28675A23D189838EF1E2EE652C013ECB4AEA906112324975C3CD49B83BFACCBDD7D90C4BD7098488E9C219A73724EFFD6FAE5644738FAA31A4FF55BCCC0A151AF5F0DC8B4BD45BF37DF365C1A65E68CFDA76D4DA708DF1FB2BC2E4A4371'
ghex = 'A4D1CBD5C3FD34126765A442EFB99905F8104DD258AC507FD6406CFF14266D31266FEA1E5C41564B777E690F5504F213160217B4B01B886A5E91547F9E2749F4D7FBD7D3B9A92EE1909D0D2263F80A76A6A24C087A091F531DBF0A0169B6A28AD662A4D18E73AFA32D779D5918D08BC8858F4DCEF97C2A24855E6EEB22B3B2E5'

def convertHexToNumber(value):
    return int(value, AES.block_size)

def convertNumberToHex(value):
    return hex(value)[2:].upper()


def digest(data):
    h = SHA256.new()
    h.update(data)
    return h.hexdigest()

def get_value_a(p):
    # Gerador usado para aletório a menor que p
    #return randint(0, p-1)
    
    # Valor a usado para calculo de valor A do primeiro envio:
    # a em hexadecimal: 570770D3CC40F1CDEC7F5AD2E71F349BA23A6DFC3AA6B73620E8913B42677094F16A647D57FFFDFD444E9A24E744FD2B1ABE02113F95247C24AFDA8C2647788ADAC3997D5184799E749858D127328B34EB856EA9CDF34F4F60C73939AA2636EA0DA87B73D466C40672372F106597ACD64A16C671C7FC6FF811C13714E235CA4F
    return 61113888018937514646861624826374675262675216984340776789624861985435948077680777636492159861100619421849715487866228065696068416938535532082019974863627676996298453174624555037669169782825942716986578953554755282918735464393756756705905108952133660061197413553448386367283324256216797248140082470912695585359
    


# Valor enviado inicialmente:
def generateA():
    a = get_value_a(convertHexToNumber(phex))
    p = convertHexToNumber(phex)
    g = convertHexToNumber(ghex)
    
    # Calculo de valor A a ser enviado inicialmente:
    return convertNumberToHex( pow(g, a, p) )
    
    # Valor efetivamente enviado inicialmente:
    # A2B4431A05A23ECB31F55427119316F950A52A4C18BC801ABE2E3F20FE77CFF5711157D0810A28568647B81D4184F7A4DE245FF4BCD88FB3F49BDB6DF759700B1CA9504FA21D902F8FD508517B00F26A4D676BE3F5FD534C33A97992A028B6D36ED56A3AF0C8FF54EAD4D9AD94B231BB46AEF3845CDBD173469DD2AA51417F55


def calculateV(bhex):
    a = get_value_a(convertHexToNumber(phex))
    p = convertHexToNumber(phex)
    b = convertHexToNumber(bhex)
    
    return pow(b, a, p)


def calculateS(V):
    VHex = convertNumberToHex(V)
    return digest(bytes.fromhex(VHex)).upper()

def calculatePasswordBasedOnS(SHex):
    return SHex[0:32]


def decryptAES(msg, password):
    msgbytes = bytes.fromhex(msg)
    iv = msgbytes[:AES.block_size]
    aes = AES.new(bytes.fromhex(password), AES.MODE_CBC, iv)
    return unpad((aes.decrypt(msgbytes[AES.block_size:]))).decode()

def encryptAES(msg, password):
    msg = pad(str(msg))
    iv = os.urandom(AES.block_size)
    cipher = AES.new(bytes.fromhex(password), AES.MODE_CBC, iv)
    return (iv + cipher.encrypt(msg.encode() ))

pad = lambda s: s + (AES.block_size - len(s) % AES.block_size) * chr(AES.block_size - len(s) % AES.block_size)
unpad = lambda s : s[:-ord(s[len(s)-1:])]




print('\n____________________________________________________\n\nPARTE 1')

# Valor a menor que p:
a = get_value_a(convertHexToNumber(phex))

# Mensagem inicialmente enviada para o professor:
A = generateA()

# Valor B recebido do professor:
B = '05B1338B5C731B49B24E1A3658CE697206C6FA461949878A82BCAD02B5CD136CB904DFC30D1B0FC4DDE06BD4A819240019250E6237D59B5F87E40B1316B0066C65399A5CD0762928AC377E6412AFB815116A2811F7570CAFCA40C644D3E4A93879A2AF2F5BDEB5F2A8044A6D996E14ADE9F79581F24B7E9FC70EEE08A40A0E10'

# Mensagem encriptada:
msg = 'EC0980BCA8041FC93247E79087F4AB80C495E78CCD3517E9F7A60DEF2E9B93229077B3686A25E74CB3BF5EDA17D29A60BEEBD183FBBC28968BB0065BFA865FA626A324E70B557BB373B7FF4C018FDF30CDE71FFB51322A188FF7F5F1CD7775DD726B9B993AB6C8CFB39F980667541899'

# Valor V obtido por B^a mod p:
V = calculateV(B)

# Valor S obtido por SHA256(V):
S = calculateS(V)

# Senha obtida pelos primeiros 128 bits de S:
password = calculatePasswordBasedOnS(S)

print('\nValor a menor que p gerado (a em hexa):\n' + convertNumberToHex(a))
print('\nMensagem enviada inicialmente (A):\n' + A)
print('\nResposta recebida (B):\n' + B)
print('\nChave gerada usando Diffie-Hellman (password):\n' + password)



print('\n\n____________________________________________________\n\nPARTE 2')

msgDecrypted = decryptAES(msg, password)
invertedMsgDecrypted = msgDecrypted[::-1]
msgEncrypted = encryptAES(invertedMsgDecrypted, password)


print('\nMensagem recebida com IV em hexadecimal: \n' + msg)
print('\nMensagem recebida em texto claro: \n' + msgDecrypted)

print('\nMensagem recebida em texto claro invertida: \n' + invertedMsgDecrypted)
print('\nMensagem recebida cifrada e invertida em hexadecimal para ser enviada: \n' + msgEncrypted.hex())