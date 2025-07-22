#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const regexes = {
  // JavaScript
  "Uso de eval()": [/eval\s*\(/],
  "Uso de document.write()": [/document\.write\s*\(/],
  "Uso de innerHTML inseguro": [/\.innerHTML\s*=\s*[^;]+/],
  "Variables globales (var sin función)": [/^var\s+[a-zA-Z0-9_]+/],
  // HTML
  "Uso de etiquetas obsoletas": [/<\/?(font|center|marquee|blink)[^>]*>/i],
  "Uso de estilo en línea": [/style\s*=\s*["'][^"']+["']/i],
  // CSS
  "Uso de !important": [/\!important/],
  "Uso del selector universal *": [/^\s*\*\s*\{/]
};

const errores = [];

function analizarArchivo(filepath) {
  const ext = path.extname(filepath);
  const tipo = ext.toLowerCase();

  const lineas = fs.readFileSync(filepath, "utf-8").split("\n");
  lineas.forEach((linea, nro) => {
    for (const [desc, patrones] of Object.entries(regexes)) {
      for (const patron of patrones) {
        if (patron.test(linea)) {
          errores.push(`[${desc}] ${filepath}: línea ${nro + 1}: ${linea.trim()}`);
        }
      }
    }
  });
}

function recorrerDirectorio(directorio) {
  const archivos = fs.readdirSync(directorio);
  for (const archivo of archivos) {
    const fullPath = path.join(directorio, archivo);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      recorrerDirectorio(fullPath);
    } else if ([".js", ".html", ".css"].includes(path.extname(fullPath).toLowerCase())) {
      analizarArchivo(fullPath);
    }
  }
}

if (process.argv.length < 3) {
  console.error("Uso: node analizar_practicas.js /ruta/al/proyecto");
  process.exit(1);
}

const ruta = process.argv[2];
if (!fs.existsSync(ruta) || !fs.statSync(ruta).isDirectory()) {
  console.error("Error: Ruta inválida");
  process.exit(1);
}

recorrerDirectorio(ruta);

console.log(`${errores.length} posibles malas prácticas encontradas.`);
console.log(errores.join("\n"));
