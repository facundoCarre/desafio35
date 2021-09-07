function obtenerRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
process.on('message', cantidad => {
    let arrayNumeros = []
    for (let i = 0; i < cantidad; i++) {
        arrayNumeros.push(obtenerRandom(1,1000))
    }
    let result = { };
     for(i = 0; i < arrayNumeros.length; ++i) 
     { if(!result[arrayNumeros[i]]) 
        result[arrayNumeros[i]] = 0; 
        ++result[arrayNumeros[i]]; 
    }
    console.log(`el array de numeros es  ${JSON.stringify(result,null,3)}`);
    process.send(result);
});