export function asignarProfesores(profesoresOriginal, bloquesOriginales) {
    const bloques = bloquesOriginales.map(b => ({ ...b }));
    const profesores = profesoresOriginal.map(p => ({
      ...p,
      bloquesDisponibles: Array.isArray(p.bloquesDisponibles)
        ? p.bloquesDisponibles
        : typeof p.bloquesDisponibles === 'string'
        ? p.bloquesDisponibles.split(',').map(b => b.trim())
        : [],
      asignados: 0,
      bloquesOcupados: new Set(),
      bloquesEsperados: p.bloquesAsignados,
    }));
  
    // 🔹 1. Asignar SA09 y SA11 pareados
    let sa09Libres = bloques.filter(b => b.idBloque === 'SA09' && !b.profesorAsignado);
    let sa11Libres = bloques.filter(b => b.idBloque === 'SA11' && !b.profesorAsignado);
  
    const profesoresSA = profesores.filter(p =>
      p.bloquesDisponibles.includes('SA09') &&
      p.bloquesDisponibles.includes('SA11')
    );
  
    for (const prof of profesoresSA) {
      if (prof.asignados + 2 > prof.bloquesEsperados) continue;
      const sa09 = sa09Libres.shift();
      const sa11 = sa11Libres.shift();
      if (sa09 && sa11) {
        sa09.profesorAsignado = prof.nombre;
        sa11.profesorAsignado = prof.nombre;
        prof.bloquesOcupados.add('SA09');
        prof.bloquesOcupados.add('SA11');
        prof.asignados += 2;
      }
    }
  
    // 🔹 2. Asignar a Ivette COMPLETA
    const ivette = profesores.find(p => p.nombre.includes('Ivette Lissette Aguirre Reyes'));
    if (ivette) {
      for (let i = 0; i < ivette.bloquesDisponibles.length; i++) {
        if (ivette.asignados >= ivette.bloquesEsperados) break;
        const bloque = ivette.bloquesDisponibles[i];
        if (ivette.bloquesOcupados.has(bloque)) continue;
  
        const taller = bloques.find(t => t.idBloque === bloque && !t.profesorAsignado);
        if (taller) {
          taller.profesorAsignado = ivette.nombre;
          ivette.bloquesOcupados.add(bloque);
          ivette.asignados++;
        }
      }
    }
  
    // 🔹 3. Alta carga (≥10)
    const altaCarga = profesores
      .filter(p => p.bloquesEsperados >= 10 && p.nombre !== ivette?.nombre)
      .sort((a, b) => b.bloquesEsperados - a.bloquesEsperados);
  
    asignarPorOrden(altaCarga);
  
    // 🔹 4. Media carga (5 a 9)
    const mediaCarga = profesores
      .filter(p => p.bloquesEsperados >= 5 && p.bloquesEsperados < 10 && p.nombre !== ivette?.nombre)
      .sort((a, b) => b.bloquesEsperados - a.bloquesEsperados);
  
    asignarPorOrden(mediaCarga);
  
    // 🔹 5. Baja carga (<5)
    const bajaCarga = profesores
      .filter(p => p.bloquesEsperados < 5 && p.nombre !== ivette?.nombre)
      .sort((a, b) => a.bloquesEsperados - b.bloquesEsperados);
  
    asignarPorOrden(bajaCarga);
  
    // 🔁 6. Corrección final: quitar a baja carga si otros están incompletos
    const incompletos = profesores.filter(p => p.asignados < p.bloquesEsperados);
    for (const incompleto of incompletos) {
      const faltantes = incompleto.bloquesEsperados - incompleto.asignados;
      for (let i = 0; i < faltantes; i++) {
        const donador = bajaCarga.find(d =>
          d.asignados > 0 &&
          d.bloquesDisponibles.some(b => incompleto.bloquesDisponibles.includes(b))
        );
  
        if (donador) {
          const bloqueDonable = [...donador.bloquesOcupados].find(b =>
            incompleto.bloquesDisponibles.includes(b)
          );
  
          if (bloqueDonable) {
            const taller = bloques.find(b => b.idBloque === bloqueDonable);
            taller.profesorAsignado = incompleto.nombre;
            donador.bloquesOcupados.delete(bloqueDonable);
            donador.asignados--;
            incompleto.bloquesOcupados.add(bloqueDonable);
            incompleto.asignados++;
          }
        }
      }
    }
  // 🔚 Paso Final: Si quedan bloques sin asignar, repartir entre los de alta carga
const bloquesRestantes = bloques.filter(b => !b.profesorAsignado);
const candidatosFinales = profesores
  .filter(p => p.bloquesEsperados >= 10)
  .sort((a, b) => a.asignados - b.asignados); // Menor asignado primero

let index = 0;

for (const bloque of bloquesRestantes) {
  let intentos = 0;
  let asignado = false;

  // Buscar entre los candidatos uno que pueda recibirlo
  while (intentos < candidatosFinales.length && !asignado) {
    const prof = candidatosFinales[index % candidatosFinales.length];

    if (
      prof.bloquesDisponibles.includes(bloque.idBloque) &&
      !prof.bloquesOcupados.has(bloque.idBloque)
    ) {
      bloque.profesorAsignado = prof.nombre;
      prof.bloquesOcupados.add(bloque.idBloque);
      prof.asignados++;
      asignado = true;
    }

    index++;
    intentos++;
  }
}

    return bloques;
  
    // 📦 Función genérica de asignación ordenada
    function asignarPorOrden(lista) {
      for (const prof of lista) {
        for (let i = 0; i < prof.bloquesDisponibles.length; i++) {
          const bloque = prof.bloquesDisponibles[i];
          if (prof.asignados >= prof.bloquesEsperados) break;
          if (prof.bloquesOcupados.has(bloque)) continue;
  
          const taller = bloques.find(t =>
            t.idBloque === bloque &&
            !t.profesorAsignado
          );
  
          if (taller) {
            taller.profesorAsignado = prof.nombre;
            prof.bloquesOcupados.add(bloque);
            prof.asignados++;
          }
        }
      }
    }
  }
  
