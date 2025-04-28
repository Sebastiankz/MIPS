MIPS Visual Simulator (Single Cycle)

A javascript based MIPS simulator that can simulate the MIPS assembly code.

To run on dev mode, run the following command

```bash
 cd app
 nmp install
 npm run dev
```

To deply the app, run the following command

````bash
 docker build -t mipsvisualsimisinglei .
 docker run -d -it -p 80:3000 --restart unless-stopped --name mipsvisualsimisingle-app mipsvisualsimisinglei

# Test instructions
```assembly
addi t0 t0 0x0001
addi t1 t1 0x0002
addi t2 t2 0x0003
addi t3 t3 0x0004
addi t4 t4 0x0005
add t0 t0 t0
add t1 t0 t0
add t2 t1 t1
add t3 t2 t2
add t4 t3 t3
````
