// Script de prueba para verificar el calendario personalizado
// Ejecutar en la consola del navegador después de cargar la aplicación

window.testCalendar = function() {
  console.log('📅 Probando calendario personalizado...');
  
  // 1. Verificar que el calendario se renderiza correctamente
  const calendarGrid = document.querySelector('.grid.grid-cols-7.gap-2');
  if (calendarGrid) {
    console.log('✅ Calendario encontrado');
    
    // 2. Verificar que tiene 42 celdas (6 filas × 7 días)
    const cells = calendarGrid.children;
    console.log(`📊 Celdas encontradas: ${cells.length} (esperado: 42)`);
    
    // 3. Verificar que los días de la semana están en el header
    const dayHeaders = document.querySelectorAll('.grid.grid-cols-7.gap-2.mb-2 > div');
    if (dayHeaders.length === 7) {
      console.log('✅ Headers de días de la semana encontrados');
      const dayNames = Array.from(dayHeaders).map(header => header.textContent);
      console.log('📝 Días de la semana:', dayNames);
    } else {
      console.log('❌ Headers de días de la semana no encontrados');
    }
    
    // 4. Verificar que hay botones clickeables para los días del mes actual
    const dayButtons = calendarGrid.querySelectorAll('button');
    console.log(`🔘 Botones de días encontrados: ${dayButtons.length}`);
    
    // 5. Verificar que hay días con diferentes estados
    const completedDays = calendarGrid.querySelectorAll('.bg-green-100');
    const incompleteDays = calendarGrid.querySelectorAll('.bg-yellow-100');
    const absentDays = calendarGrid.querySelectorAll('.bg-gray-50');
    
    console.log(`🟢 Días completados: ${completedDays.length}`);
    console.log(`🟡 Días incompletos: ${incompleteDays.length}`);
    console.log(`⚪ Días sin registro: ${absentDays.length}`);
    
    // 6. Verificar la leyenda
    const legend = document.querySelector('.flex.flex-wrap.gap-4.pt-4.border-t');
    if (legend) {
      console.log('✅ Leyenda encontrada');
    } else {
      console.log('❌ Leyenda no encontrada');
    }
    
  } else {
    console.log('❌ Calendario no encontrado');
  }
  
  // 7. Verificar navegación del calendario
  const prevButton = document.querySelector('button[aria-label="Previous month"], button:has(svg:first-child)');
  const nextButton = document.querySelector('button[aria-label="Next month"], button:has(svg:last-child)');
  
  if (prevButton && nextButton) {
    console.log('✅ Botones de navegación encontrados');
  } else {
    console.log('❌ Botones de navegación no encontrados');
  }
  
  console.log('🎉 Prueba del calendario completada');
};

console.log('🔧 Función de prueba del calendario cargada. Ejecuta: testCalendar()');
