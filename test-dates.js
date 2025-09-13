// Script de prueba para verificar el manejo correcto de fechas
// Ejecutar en la consola del navegador después de cargar la aplicación

window.testDates = function() {
  console.log('📅 Probando manejo de fechas...');
  
  // 1. Probar la función toLocalDateString
  const testDate = new Date(2024, 0, 13); // 13 de enero de 2024
  console.log('Fecha de prueba:', testDate);
  console.log('toISOString().split("T")[0]:', testDate.toISOString().split('T')[0]);
  console.log('toLocaleDateString("en-CA"):', testDate.toLocaleDateString('en-CA'));
  
  // 2. Probar con la fecha actual
  const now = new Date();
  console.log('Fecha actual:', now);
  console.log('UTC date string:', now.toISOString().split('T')[0]);
  console.log('Local date string:', now.toLocaleDateString('en-CA'));
  
  // 3. Verificar la diferencia de zona horaria
  const utcOffset = now.getTimezoneOffset();
  console.log('UTC offset (minutes):', utcOffset);
  console.log('UTC offset (hours):', utcOffset / 60);
  
  // 4. Probar con diferentes fechas
  const dates = [
    new Date(2024, 0, 13, 23, 30), // 13 enero 23:30
    new Date(2024, 0, 14, 0, 30),  // 14 enero 00:30
    new Date(2024, 0, 14, 12, 0),  // 14 enero 12:00
  ];
  
  console.log('\\nComparación de fechas:');
  dates.forEach((date, index) => {
    console.log(`Fecha ${index + 1}:`, date.toLocaleString());
    console.log(`  UTC string: ${date.toISOString().split('T')[0]}`);
    console.log(`  Local string: ${date.toLocaleDateString('en-CA')}`);
  });
};

console.log('🔧 Función de prueba de fechas cargada. Ejecuta: testDates()');
