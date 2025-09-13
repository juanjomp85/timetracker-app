// Archivo de prueba para verificar las funciones del backend
// Este archivo simula las llamadas a la API para verificar el funcionamiento

const BASE_URL = 'https://vltpfknesnrxldcjnhdx.supabase.co/functions/v1/make-server-f2f8e889';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdHBma25lc25yeGxkY2puaGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NDkwMzEsImV4cCI6MjA3MjAyNTAzMX0.r-PF1xcWPBQSJQaUHqoztCaLFji8ly8r9fS2imkmExA';

// Función para hacer llamadas a la API
async function testAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Función para probar el check-in
async function testCheckIn(userId = 'test-user-123') {
  console.log('🧪 Probando check-in...');
  
  try {
    const response = await testAPI('/time-entries', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'check_in', 
        userId: userId 
      })
    });
    
    console.log('✅ Check-in exitoso:', response);
    return response.entry;
  } catch (error) {
    console.error('❌ Error en check-in:', error);
    return null;
  }
}

// Función para probar el check-out
async function testCheckOut(userId = 'test-user-123') {
  console.log('🧪 Probando check-out...');
  
  try {
    const response = await testAPI('/time-entries', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'check_out', 
        userId: userId 
      })
    });
    
    console.log('✅ Check-out exitoso:', response);
    return response.entry;
  } catch (error) {
    console.error('❌ Error en check-out:', error);
    return null;
  }
}

// Función para obtener el historial
async function testGetHistory(userId = 'test-user-123') {
  console.log('🧪 Probando obtención de historial...');
  
  try {
    const response = await testAPI(`/time-entries/history?userId=${userId}`);
    console.log('✅ Historial obtenido:', response);
    return response.entries;
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    return [];
  }
}

// Función para obtener las estadísticas de hoy
async function testGetToday(userId = 'test-user-123') {
  console.log('🧪 Probando obtención de entrada de hoy...');
  
  try {
    const response = await testAPI(`/time-entries/today?userId=${userId}`);
    console.log('✅ Entrada de hoy obtenida:', response);
    return response.entry;
  } catch (error) {
    console.error('❌ Error obteniendo entrada de hoy:', error);
    return null;
  }
}

// Función para obtener analytics
async function testGetAnalytics(userId = 'test-user-123') {
  console.log('🧪 Probando obtención de analytics...');
  
  try {
    const response = await testAPI(`/analytics?userId=${userId}`);
    console.log('✅ Analytics obtenidos:', response);
    return response.analytics;
  } catch (error) {
    console.error('❌ Error obteniendo analytics:', error);
    return null;
  }
}

// Función principal de prueba
async function runTests() {
  console.log('🚀 Iniciando pruebas de funcionalidad...\n');
  
  const userId = `test-user-${Date.now()}`; // Usuario único para cada prueba
  
  // Prueba 1: Check-in
  const checkInEntry = await testCheckIn(userId);
  if (!checkInEntry) {
    console.log('❌ No se pudo hacer check-in, abortando pruebas');
    return;
  }
  
  // Prueba 2: Verificar entrada de hoy
  await testGetToday(userId);
  
  // Prueba 3: Verificar analytics después del check-in
  await testGetAnalytics(userId);
  
  // Prueba 4: Verificar historial después del check-in
  await testGetHistory(userId);
  
  // Esperar un poco antes del check-out
  console.log('⏳ Esperando 2 segundos antes del check-out...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Prueba 5: Check-out
  const checkOutEntry = await testCheckOut(userId);
  if (!checkOutEntry) {
    console.log('❌ No se pudo hacer check-out');
    return;
  }
  
  // Prueba 6: Verificar entrada de hoy después del check-out
  await testGetToday(userId);
  
  // Prueba 7: Verificar analytics después del check-out
  await testGetAnalytics(userId);
  
  // Prueba 8: Verificar historial después del check-out
  await testGetHistory(userId);
  
  console.log('\n🎉 Todas las pruebas completadas exitosamente!');
  console.log('📊 Resumen de la sesión de prueba:');
  console.log(`   - Usuario: ${userId}`);
  console.log(`   - Check-in: ${checkInEntry.checkIn}`);
  console.log(`   - Check-out: ${checkOutEntry.checkOut}`);
  console.log(`   - Horas trabajadas: ${checkOutEntry.totalHours}h`);
}

// Ejecutar las pruebas si se ejecuta directamente
if (typeof window === 'undefined') {
  // Node.js environment
  runTests().catch(console.error);
} else {
  // Browser environment
  window.runTests = runTests;
  console.log('🧪 Para ejecutar las pruebas, ejecuta: window.runTests()');
}

