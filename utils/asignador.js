// utils/asignador.js

export function asignarProfesores(profesoresOriginal, bloquesOriginales) {
    const bloques = bloquesOriginales.map(b => ({ ...b }));
    const profesores = profesoresOriginal.map(p => ({
      ...p,
      asignados: 0,
      bloquesOcupados: new Set(),
      bloquesSabado: 0,
    }));
  
    // 🔥 PASO 1: ASIGNAR SA09 Y SA11 EN PARES 🔥
    let sa09Pendientes = bloques.filter(b => b.idBloque === 'SA09' && !b.profesorAsignado);
    let sa11Pendientes = bloques.filter(b => b.idBloque === 'SA11' && !b.profesorAsignado);
    let profesoresSA = profesores.filter(p => 
      p.bloquesDisponibles.includes('SA09') && p.bloquesDisponibles.includes('SA11')
    );
  
    for (const prof of profesoresSA) {
      if (prof.asignados + 2 > prof.bloquesAsignados) continue;
  
      const sa09 = sa09Pendientes.shift();
      const sa11 = sa11Pendientes.shift();
  
      if (sa09 && sa11) {
        sa09.profesorAsignado = prof.nombre;
        sa11.profesorAsignado = prof.nombre;
        prof.asignados += 2;
        prof.bloquesOcupados.add('SA09');
        prof.bloquesOcupados.add('SA11');
      }
    }
  
    // 🔥 PASO 2: ASIGNAR A PROFESORES CON 10 O MÁS BLOQUES 🔥
    let profesores10Mas = profesores.filter(p => p.bloquesAsignados >= 10);
  
    for (const prof of profesores10Mas) {
      for (let i = prof.bloquesDisponibles.length - 1; i >= 0; i--) {
        const bloque = prof.bloquesDisponibles[i];
        if (prof.asignados >= prof.bloquesAsignados) break;
        if (prof.bloquesOcupados.has(bloque)) continue;
  
        const taller = bloques.find(t => 
          t.idBloque === bloque &&
          !t.profesorAsignado
        );
  
        if (taller) {
          taller.profesorAsignado = prof.nombre;
          prof.asignados++;
          prof.bloquesOcupados.add(taller.idBloque);
        }
      }
    }
  
    // 🔥 PASO 3: ASIGNAR A LOS DEMÁS PROFESORES 🔥
    let profesoresMenos10 = profesores.filter(p => p.bloquesAsignados < 10);
  
    for (const prof of profesoresMenos10) {
      for (let i = prof.bloquesDisponibles.length - 1; i >= 0; i--) {
        const bloque = prof.bloquesDisponibles[i];
        if (prof.asignados >= prof.bloquesAsignados) break;
        if (prof.bloquesOcupados.has(bloque)) continue;
  
        const taller = bloques.find(t => 
          t.idBloque === bloque &&
          !t.profesorAsignado
        );
  
        if (taller) {
          taller.profesorAsignado = prof.nombre;
          prof.asignados++;
          prof.bloquesOcupados.add(taller.idBloque);
        }
      }
    }
  
    // 🔥 PASO 4: SI QUEDAN BLOQUES, ASIGNARLOS A LOS QUE TIENEN MÁS BLOQUES 🔥
    let bloquesNoAsignados = bloques.filter(b => !b.profesorAsignado);
    let profesoresOrdenados = [...profesores].sort(
      (a, b) => b.bloquesAsignados - a.bloquesAsignados
    );
  
    for (const bloque of bloquesNoAsignados) {
      const profesorDisponible = profesoresOrdenados.find(
        p => 
          p.bloquesDisponibles.includes(bloque.idBloque) &&
          !p.bloquesOcupados.has(bloque.idBloque)
      );
  
      if (profesorDisponible) {
        bloque.profesorAsignado = profesorDisponible.nombre;
        profesorDisponible.bloquesOcupados.add(bloque.idBloque);
      }
    }
  
    return bloques;
  }
  