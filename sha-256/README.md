# SHA-256 Media Stream Authenticator

## Running
 - Make sure python and pip are installed
 - Install PyCrypto (needed for the sha-256 algorithm): `pip install pycrypto`
 - Add the media file to the project class path (./sha-256/your-file-here).
 - Execution:
   -  Format:  `python3 main.py "your-file-here"`
   -  Example: `python3 main.py "FuncoesResumo - SHA1.mp4"`
   -  The hash code of the first block of 1024 bytes will be printed