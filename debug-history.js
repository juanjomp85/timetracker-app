// Script de depuración para verificar la actualización del historial
// Ejecutar en la consola del navegador después de cargar la aplicación

window.debugHistory = async function() {
  console.log('🔍 Iniciando depuración del historial...');
  
  try {
    // 1. Verificar que el usuario esté autenticado
    const user = JSON.parse(localStorage.getItem('timetracker_user') || 'null');
    const token = localStorage.getItem('timetracker_access_token');
    
    if (!user || !token) {
      console.log('❌ Usuario no autenticado');
      return;
    }
    
    console.log('✅ Usuario autenticado:', user.email, 'ID:', user.id);
    
    // 2. Verificar el RefreshContext
    console.log('🔄 Verificando RefreshContext...');
    
    // 3. Hacer una llamada directa a la API para obtener el historial
    console.log('📊 Obteniendo historial directamente de la API...');
    const historyResponse = await fetch(`https://vltpfknesnrxldcjnhdx.supabase.co/functions/v1/make-server-f2f8e889/time-entries/history?userId=${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ Historial obtenido de la API:', historyData);
      console.log('📝 Entradas encontradas:', historyData.entries?.length || 0);
    } else {
      console.log('❌ Error obteniendo historial:', historyResponse.status, historyResponse.statusText);
    }
    
    // 4. Simular un check-in
    console.log('📝 Simulando check-in...');
    const checkInResponse = await fetch('https://vltpfknesnrxldcjnhdx.supabase.co/functions/v1/make-server-f2f8e889/time-entries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'check_in',
        userId: user.id
      })
    });
    
    if (checkInResponse.ok) {
      const checkInData = await checkInResponse.json();
      console.log('✅ Check-in exitoso:', checkInData);
    } else {
      console.log('❌ Error en check-in:', checkInResponse.status, checkInResponse.statusText);
    }
    
    // 5. Verificar el historial después del check-in
    setTimeout(async () => {
      console.log('📊 Verificando historial después del check-in...');
      const historyResponse2 = await fetch(`https://vltpfknesnrxldcjnhdx.supabase.co/functions/v1/make-server-f2f8e889/time-entries/history?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (historyResponse2.ok) {
        const historyData2 = await historyResponse2.json();
        console.log('✅ Historial después del check-in:', historyData2);
        console.log('📝 Entradas encontradas:', historyData2.entries?.length || 0);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error en la depuración:', error);
  }
};

console.log('🔧 Función de depuración cargada. Ejecuta: debugHistory()');
