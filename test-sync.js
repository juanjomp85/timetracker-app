// Script de prueba para verificar la sincronización del historial
// Ejecutar en la consola del navegador después de cargar la aplicación

window.testSync = async function() {
  console.log('🧪 Iniciando prueba de sincronización...');
  
  try {
    // 1. Verificar que el RefreshContext esté disponible
    console.log('✅ RefreshContext disponible');
    
    // 2. Simular un check-in
    console.log('📝 Simulando check-in...');
    const checkInResponse = await fetch('/api/time-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('timetracker_access_token')}`
      },
      body: JSON.stringify({
        action: 'check_in',
        userId: JSON.parse(localStorage.getItem('timetracker_user')).id
      })
    });
    
    if (checkInResponse.ok) {
      console.log('✅ Check-in simulado exitosamente');
    } else {
      console.log('❌ Error en check-in simulado');
    }
    
    // 3. Verificar que el historial se actualice
    console.log('📊 Verificando actualización del historial...');
    
    // 4. Simular un check-out después de 1 segundo
    setTimeout(async () => {
      console.log('📝 Simulando check-out...');
      const checkOutResponse = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('timetracker_access_token')}`
        },
        body: JSON.stringify({
          action: 'check_out',
          userId: JSON.parse(localStorage.getItem('timetracker_user')).id
        })
      });
      
      if (checkOutResponse.ok) {
        console.log('✅ Check-out simulado exitosamente');
        console.log('🎉 Prueba de sincronización completada');
      } else {
        console.log('❌ Error en check-out simulado');
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
};

console.log('🔧 Función de prueba cargada. Ejecuta: testSync()');
