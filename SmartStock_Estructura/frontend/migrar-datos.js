// migrar-datos.js
// Ejecuta este script UNA SOLA VEZ para importar tus datos de Supabase a Firestore
// Cómo usarlo:
//   1. Colócalo en la raíz de tu proyecto frontend
//   2. npm install firebase  (si no lo tienes)
//   3. node migrar-datos.js

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";

// 🔴 Pon aquí tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCSoOL9MSD72lJG5G0wy7pC-QEzYsc5xT0",
  authDomain: "smartstock-2006.firebaseapp.com",
  projectId: "smartstock-2006",
  storageBucket: "smartstock-2006.firebasestorage.app",
  messagingSenderId: "562651008558",
  appId: "1:562651008558:web:b56c036ba9b9889a7bd9bf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── DATOS EXTRAÍDOS DE TU BACKUP DE SUPABASE ────────────────────────────────

const usuarios = [
  { id: "643b97aa-3843-4386-b6db-52ad1ac875df", nombre_completo: "luci", correo: "luci@gmail.com", usuario: "luci", creado_en: "2025-10-20T03:09:27.126Z" },
  { id: "0916af77-c0eb-471b-ab16-6b571013176f", nombre_completo: "luciana", correo: "davidnaranjo@correo", usuario: "ff", creado_en: "2025-10-20T03:12:54.804Z" },
  { id: "2be91122-7ec7-49d8-b6c9-2e35552fc479", nombre_completo: "Celeste", correo: "cele@gmail.com", usuario: "cele", creado_en: "2025-10-20T03:58:52.890Z" },
  { id: "37011b2a-a754-42c6-94c9-1a503d5a6103", nombre_completo: "manuela", correo: "manuela@gmail.com", usuario: "manu", creado_en: "2025-10-20T15:21:42.416Z" },
  { id: "156a2ec2-3cb2-46fe-94d8-53a86797ba72", nombre_completo: "pepe", correo: "pepelonzo123@pepito.con", usuario: "pepe12", creado_en: "2025-10-20T16:54:40.018Z" },
  { id: "90d5aecb-0148-4197-a783-640fcbb23f89", nombre_completo: "juan", correo: "lomajuanjo@correo", usuario: "juanlm", creado_en: "2025-10-20T20:47:05.961Z" },
  { id: "11a600fd-c289-4435-9b97-db66d250dc91", nombre_completo: "alen", correo: "alen@gamil.com", usuario: "alen", creado_en: "2025-10-23T04:43:40.466Z" },
  { id: "f279d145-cc32-4672-a2b5-1323814a7e2f", nombre_completo: "Santiago Salgado Suarez", correo: "Santiago.Salgado@gmail.com", usuario: "Santiago.sal", creado_en: "2025-10-23T12:16:22.725Z" },
  { id: "724ce77a-8eb1-4ccb-8cea-dfa4962cffb5", nombre_completo: "luciana garzon", correo: "luci.garzon@gmail.com", usuario: "lucii", creado_en: "2025-10-23T15:18:27.377Z" },
  { id: "64dcda10-d16c-47ac-bb52-498ec1608723", nombre_completo: "asdf", correo: "lucsdfi@gmail.com", usuario: "aaa", creado_en: "2025-10-30T16:19:31.168Z" },
  { id: "e44921e1-9c08-47af-b56f-6256b521a028", nombre_completo: "candy", correo: "candy42034@gmail.com", usuario: "candy", creado_en: "2025-11-17T23:30:50.696Z" },
  { id: "6241a899-60f3-43a4-83dc-4b9338549a41", nombre_completo: "kaka", correo: "luciana0000garzon@gmail.com", usuario: "kaka", creado_en: "2025-11-18T15:16:20.905Z" },
];

const inventario = [
  { id: "a2cf0e2f-6e8f-4324-b7b0-72f59887ec26", nombre: "Arroz", precio: 200000, costo: 100000, cantidad: 14, unidad: "12", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df" },
  { id: "74c0457e-74a4-4b9c-b215-a8f37abb9633", nombre: "Nacional", precio: 2000, costo: 1000, cantidad: 1, unidad: "", user_id: null },
  { id: "1a00bc58-ced3-418c-9f82-a350b46b52e5", nombre: "Arroz", precio: 2, costo: 1, cantidad: 1, unidad: "", user_id: "8f28dab2-5d32-44af-be6f-0c4a377dcf9f" },
  { id: "e36bcc7d-13fa-407e-8ec4-3c59cb7a7176", nombre: "Arroz", precio: 5000, costo: 3000, cantidad: 12, unidad: "", user_id: "2be91122-7ec7-49d8-b6c9-2e35552fc479" },
  { id: "b60d38e1-b329-49b7-8287-0db68d5a3c86", nombre: "Papa", precio: 1000, costo: 4000, cantidad: 11, unidad: "", user_id: "2be91122-7ec7-49d8-b6c9-2e35552fc479" },
  { id: "c9018d2d-4e17-46af-b122-b30e371e5b80", nombre: "Arroz", precio: 2000, costo: 40000, cantidad: 18, unidad: "", user_id: "90d5aecb-0148-4197-a783-640fcbb23f89" },
  { id: "48b20613-700c-40c4-a2ae-912fb07c2f22", nombre: "papas", precio: 2000, costo: 1500, cantidad: 23, unidad: "12", user_id: "11a600fd-c289-4435-9b97-db66d250dc91" },
  { id: "827de9ad-c4da-4946-b084-f8347643fadd", nombre: "arroz", precio: 2300, costo: 2000, cantidad: 0, unidad: "23", user_id: "11a600fd-c289-4435-9b97-db66d250dc91" },
  { id: "8142692f-5e8c-4747-8bf0-5c4c2cccb900", nombre: "Tangas", precio: 7000, costo: 5000, cantidad: 20, unidad: "8", user_id: "f279d145-cc32-4672-a2b5-1323814a7e2f" },
  { id: "febdc0d2-256d-4980-8be1-6b9ede0d44f4", nombre: "Arroz", precio: 18000, costo: 20000, cantidad: 10, unidad: "", user_id: "724ce77a-8eb1-4ccb-8cea-dfa4962cffb5" },
  { id: "7d9e45e8-0efe-4d4e-842a-f1ce4720062d", nombre: "Arroz", precio: 30000, costo: 20000, cantidad: 9, unidad: "", user_id: "724ce77a-8eb1-4ccb-8cea-dfa4962cffb5" },
  { id: "160358fe-d67f-43e7-ba98-4e8c994c0b6f", nombre: "Arroz", precio: 20000, costo: 10000, cantidad: -33, unidad: "111", user_id: "64dcda10-d16c-47ac-bb52-498ec1608723" },
  { id: "fac342c4-31e3-4417-9b16-c80624a4a5c5", nombre: "Arroz", precio: 200000, costo: 100000, cantidad: 9, unidad: "12", user_id: "64dcda10-d16c-47ac-bb52-498ec1608723" },
  { id: "3e7d793e-d206-43a4-a2dd-4d5a9d77e4d2", nombre: "Arroz", precio: 200000, costo: 100000, cantidad: 17, unidad: "12", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df" },
  { id: "f770f01f-52b2-454f-b3fe-4c4b309216e1", nombre: "yuca", precio: 300000, costo: 200000, cantidad: 20, unidad: "10", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df" },
  { id: "4e2b09ea-1c9b-473e-ad9d-3a822c924e6d", nombre: "yuca", precio: 300000, costo: 200000, cantidad: 20, unidad: "10", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df" },
  { id: "bb5e51ca-4ce7-4f2c-b123-6bfbb48422ab", nombre: "yuca", precio: 300000, costo: 200000, cantidad: -30, unidad: "10", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df" },
];

const empleados = [
  { id: "3", nombre_completo: "luciana", cargo: "secretaria", correo: "luci@gmail.com", telefono: "22392928" },
];

const gastos = [
  { id: "11", descripcion: "piso", monto: 1, metodo_pago: "efectivo", creado_en: "2025-10-21T23:16:10.586Z" },
  { id: "12", descripcion: "TECHO", monto: 11, metodo_pago: "efectivo", creado_en: "2025-10-21T23:20:59.684Z" },
  { id: "13", descripcion: "TECHO", monto: 11, metodo_pago: "efectivo", creado_en: "2025-10-21T23:21:09.491Z" },
  { id: "14", descripcion: "arroz", monto: 2, metodo_pago: "nequi", creado_en: "2025-10-23T05:16:37.936Z" },
  { id: "15", descripcion: "mesa", monto: 100000, metodo_pago: "efectivo", creado_en: "2025-10-23T15:24:43.591Z" },
  { id: "16", descripcion: "mesa", monto: 10000, metodo_pago: "efectivo", creado_en: "2025-10-30T16:23:13.338Z" },
  { id: "17", descripcion: "l", monto: 50000000, metodo_pago: "nequi", creado_en: "2025-11-13T17:03:48.331Z" },
];

const ventas = [
  { id: "4", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df", fecha: "2025-10-21", cliente: "Cliente general", metodo_pago: "efectivo", total: 2000 },
  { id: "5", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df", fecha: "2025-10-21", cliente: "Cliente general", metodo_pago: "efectivo", total: 2000 },
  { id: "7", user_id: "90d5aecb-0148-4197-a783-640fcbb23f89", fecha: "2025-10-21", cliente: "Cliente general", metodo_pago: "efectivo", total: 2000 },
  { id: "12", user_id: "11a600fd-c289-4435-9b97-db66d250dc91", fecha: "2025-10-23", cliente: "manuela", metodo_pago: "nequi", total: 27600 },
  { id: "13", user_id: "11a600fd-c289-4435-9b97-db66d250dc91", fecha: "2025-10-23", cliente: "alen", metodo_pago: "nequi", total: 2300 },
  { id: "16", user_id: "f279d145-cc32-4672-a2b5-1323814a7e2f", fecha: "2025-10-23", cliente: "Cliente general", metodo_pago: "efectivo", total: 140000 },
  { id: "20", user_id: "724ce77a-8eb1-4ccb-8cea-dfa4962cffb5", fecha: "2025-10-23", cliente: "david", metodo_pago: "efectivo", total: 30000 },
  { id: "23", user_id: "64dcda10-d16c-47ac-bb52-498ec1608723", fecha: "2025-10-30", cliente: "lala", metodo_pago: "efectivo", total: 200000 },
  { id: "24", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df", fecha: "2025-11-06", cliente: "Cliente general", metodo_pago: "efectivo", total: 200000 },
  { id: "37", user_id: "643b97aa-3843-4386-b6db-52ad1ac875df", fecha: "2025-11-13", cliente: "Cliente general", metodo_pago: "nequi", total: 200000 },
];

const detalle_ventas = [
  { id: "4", venta_id: "7", producto_id: "c9018d2d-4e17-46af-b122-b30e371e5b80", nombre: "Arroz", cantidad: 1, precio_unitario: 2000, subtotal: 2000 },
  { id: "5", venta_id: "8", producto_id: "c9018d2d-4e17-46af-b122-b30e371e5b80", nombre: "Arroz", cantidad: 1, precio_unitario: 2000, subtotal: 2000 },
  { id: "9", venta_id: "12", producto_id: "827de9ad-c4da-4946-b084-f8347643fadd", nombre: "arroz", cantidad: 12, precio_unitario: 2300, subtotal: 27600 },
  { id: "13", venta_id: "16", producto_id: "8142692f-5e8c-4747-8bf0-5c4c2cccb900", nombre: "Tangas", cantidad: 20, precio_unitario: 7000, subtotal: 140000 },
  { id: "17", venta_id: "20", producto_id: "7d9e45e8-0efe-4d4e-842a-f1ce4720062d", nombre: "Arroz", cantidad: 1, precio_unitario: 30000, subtotal: 30000 },
  { id: "20", venta_id: "23", producto_id: "fac342c4-31e3-4417-9b16-c80624a4a5c5", nombre: "Arroz", cantidad: 1, precio_unitario: 200000, subtotal: 200000 },
  { id: "25", venta_id: "28", producto_id: "3e7d793e-d206-43a4-a2dd-4d5a9d77e4d2", nombre: "Arroz", cantidad: 3, precio_unitario: 200000, subtotal: 600000 },
  { id: "26", venta_id: "29", producto_id: "bb5e51ca-4ce7-4f2c-b123-6bfbb48422ab", nombre: "yuca", cantidad: 10, precio_unitario: 300000, subtotal: 3000000 },
  { id: "34", venta_id: "37", producto_id: "a2cf0e2f-6e8f-4324-b7b0-72f59887ec26", nombre: "Arroz", cantidad: 1, precio_unitario: 200000, subtotal: 200000 },
];

// ─── FUNCIÓN PRINCIPAL DE MIGRACIÓN ──────────────────────────────────────────

async function migrar() {
  console.log("🚀 Iniciando migración a Firestore...\n");

  // USUARIOS (usan su UUID de Supabase como ID de documento)
  console.log("📋 Migrando usuarios...");
  for (const u of usuarios) {
    const { id, ...data } = u;
    await setDoc(doc(db, "usuarios", id), data);
    console.log(`  ✅ Usuario: ${data.nombre_completo}`);
  }

  // INVENTARIO (usan su UUID como ID de documento)
  console.log("\n📦 Migrando inventario...");
  for (const item of inventario) {
    const { id, ...data } = item;
    await setDoc(doc(db, "inventario", id), data);
    console.log(`  ✅ Producto: ${data.nombre}`);
  }

  // EMPLEADOS
  console.log("\n👥 Migrando empleados...");
  for (const e of empleados) {
    const { id, ...data } = e;
    await setDoc(doc(db, "empleados", id), data);
    console.log(`  ✅ Empleado: ${data.nombre_completo}`);
  }

  // GASTOS
  console.log("\n💸 Migrando gastos...");
  for (const g of gastos) {
    const { id, ...data } = g;
    await setDoc(doc(db, "gastos", id), data);
    console.log(`  ✅ Gasto: ${data.descripcion}`);
  }

  // VENTAS
  console.log("\n🛒 Migrando ventas...");
  for (const v of ventas) {
    const { id, ...data } = v;
    await setDoc(doc(db, "ventas", id), data);
    console.log(`  ✅ Venta ID: ${id}`);
  }

  // DETALLE VENTAS
  console.log("\n🧾 Migrando detalle de ventas...");
  for (const d of detalle_ventas) {
    const { id, ...data } = d;
    await setDoc(doc(db, "detalle_ventas", id), data);
    console.log(`  ✅ Detalle venta ID: ${id}`);
  }

  console.log("\n🎉 ¡Migración completada exitosamente!");
}

migrar().catch(console.error);
