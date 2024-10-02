import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from './configuration';
import Entita from './models/Entita';
import PreparazioneEntita from './models/PreparazioneEntita';
import Preparazione from './models/Preparazione';

function keyBy(objectList, fieldToKey) {
  let result = {}
  objectList.forEach(item => result[item[fieldToKey]] = item)
  return result
}

function groupBy(objectList, fieldToGroup) {
  let result = {}
  objectList.forEach(item => {
    if (!result.hasOwnProperty(item[fieldToGroup])) result[item[fieldToGroup]] = [] 
    result[item[fieldToGroup]].push(item)
  })
  return result
}

function groupByToSet(objectList, fieldToGroup, fieldToSet) {
  let result = {}
  objectList.forEach(item => {
    if (!result.hasOwnProperty(item[fieldToGroup])) result[item[fieldToGroup]] = [] 
    result[item[fieldToGroup]].push(item[fieldToSet])
  })
  return result
}

function groupByToField(objectList, fieldToGroup, field) {
  let result = {}
  objectList.forEach(item => {
    result[item[fieldToGroup]] = item[field]
  })
  return result
}

async function getData() {
  console.log('fetch')
  const entitaCollection = collection(db, 'entita')
  const preparazioneCollection = collection(db, 'preparazione');
  const preparazioneEntitaCollection = collection(db, 'preparazione-entita')

  const entitaQuery = query(entitaCollection)
  const entitaData = await getDocs(entitaQuery);
  const preparazioneQuery = query(preparazioneCollection, orderBy('giorno'))
  const preparazioneData = await getDocs(preparazioneQuery)
  const preparazioneEntitaQuery = query(preparazioneEntitaCollection)
  const preparazioneEntitaData = await getDocs(preparazioneEntitaQuery)

  let entitaList = []
  let preparazioneList = []
  let preparazioneEntitaList = []

  //Inserire tutti i record nelle rispettive liste
  entitaData.docs.map((doc) => entitaList.push(new Entita( doc.data().nome, doc.data().peso, doc.id, doc.data().active )))
  preparazioneData.docs.map((doc) => preparazioneList.push(new Preparazione( doc.data().giorno.seconds, doc.data().parola ?? '', doc.id )))
  preparazioneEntitaData.docs.map((doc) => preparazioneEntitaList.push(new PreparazioneEntita( doc.data().entita, doc.data().preparazione, doc.id )))
  
  //record key by i loro ID
  const entitaID2Entita = keyBy(entitaList, 'id')
  const preparazioneID2Preparazione = keyBy(preparazioneList, 'id')
  const preparazioneEntitaID2PreparazioneEntita = keyBy(preparazioneEntitaList, 'id')
  
  //ottengo la lista di oggetti con preparazione e lista di entità ordinate
  let listaDiPreparazioni = []
  const preparazioneID2ListaEntitaID = groupByToSet(Object.values(preparazioneEntitaID2PreparazioneEntita), 'preparazione', 'entita')
  Object.keys(preparazioneID2ListaEntitaID).forEach(preparazioneId => {
    let listaEntitaPerGruppoCorrente = []
    preparazioneID2ListaEntitaID[preparazioneId].forEach(entitaId => listaEntitaPerGruppoCorrente.push(entitaID2Entita[entitaId] ? entitaID2Entita[entitaId].nome : null))
    listaDiPreparazioni.push({
      ...preparazioneID2Preparazione[preparazioneId],
      listaEntita: listaEntitaPerGruppoCorrente
    })
  })

  console.log('ssjdh', listaDiPreparazioni)

  const listaDiPreparazioniSorted = listaDiPreparazioni.sort((a, b) => b.giornoDateFormat - a.giornoDateFormat)
  return [listaDiPreparazioniSorted, entitaList]
}

function getDataMock() {
  const today = new Date()
  const today1 = new Date()
  today1.setDate(today.getDate() - 1)
  const today2 = new Date()
  today2.setDate(today1.getDate() - 1)
  const today3 = new Date()
  today3.setDate(today2.getDate() - 1)
  const today4 = new Date()
  today4.setDate(today3.getDate() - 1)
  const today5 = new Date()
  today5.setDate(today4.getDate() - 1)
  const entita = [
    {nome: 'Pietro', peso: '1'},
    {nome: 'Gianmarco', peso: '1'},
    {nome: 'Francesco Paolo', peso: '1'},
    {nome: 'Beatrice', peso: '1'},
    {nome: 'Marco', peso: '1'},
    {nome: 'Ornella e Fabio', peso: '1'},
    {nome: 'Arianna', peso: '1'},
    {nome: 'Renato', peso: '1'},
    {nome: 'Federica e Alessandro', peso: '1'},
    {nome: 'Stefano e Chiara', peso: '1'},
    {nome: 'Carlo', peso: '1'},
    {nome: 'Amedeo', peso: '1'},
    {nome: 'Pio', peso: '1'},
  ]
  const prep = [
    {
      giorno: today.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'}),
      weekday: 'Sabato',
      parola: '',
      listaEntita: ['Pietro','Gianmarco','Francesco Paolo', 'Beatrice']
    },
    {
      giorno: today1.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'}),
      weekday: 'Giovedì',
      parola: 'Gloria',
      listaEntita: ['Marco','Ornella e Fabio','Arianna', 'Renato']
    },
    {
      giorno: today2.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'}),
      weekday: 'Sabato',
      parola: '',
      listaEntita: ['Gianmarco','Marco','Renato', 'Federica e Alessandro']
    },
    {
      giorno: today3.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'}),
      weekday: 'Giovedì',
      parola: 'Matrimonio',
      listaEntita: ['Pietro','Arianna','Stefano e Chiara', 'Francesco Paolo']
    },
    {
      giorno: today4.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'}),
      weekday: 'Sabato',
      parola: '',
      listaEntita: ['Marco','Renato','Carlo','Beatrice']
    },
    {
      giorno: today5.toLocaleDateString('it-IT', {year: 'numeric', month: 'short', day: 'numeric'}),
      weekday: 'Giovedì',
      parola: 'Pane',
      listaEntita: ['Pietro','Gianmarco','Stefano e Chiara', 'Federica e Alessandro']
    },
  ]

  return [prep, entita]
}

function calcolaAffinita(kpis) {
  let result = []
  Object.keys(kpis).forEach(entita => {
    let resultItem = {}
    kpis[entita].matrix.forEach(matrixItem => {
      resultItem[matrixItem.nome] = kpis[entita].tot != 0 ? (matrixItem.times / kpis[entita].tot) : 0
    })
    result[entita] = resultItem
  })

  return result
}

function calcolaPreferenzeGiorno(kpis) {
  let result = {}
  Object.keys(kpis).forEach(nomeEntita => {
    result[nomeEntita] = kpis[nomeEntita].gio >= kpis[nomeEntita].sab ? 'Giovedì' : 'Sabato'
  })
  console.log('result', result)
  return result
}

function definisciGruppiPerGiorno(gruppi, entita2giorno) {
  let giovedi = []
  let sabato = []
  let metaEMeta = []
  gruppi.forEach(gruppo => {
    if (calcolaPercentualeGiovedìHelper(gruppo, entita2giorno) < 0.5) {
      sabato.push(gruppo)
    } else if (calcolaPercentualeGiovedìHelper(gruppo, entita2giorno) > 0.5) {
      giovedi.push(gruppo)
    } else {
      console.log('meta')
      metaEMeta.push(gruppo)
    }
  })
  console.log('Meta e Meta', metaEMeta)
  if (giovedi.length - sabato.length > 0) {
    console.log('g > s')
    for (let i = 0; i < giovedi.length - sabato.length; i++) {
      if (metaEMeta.length == 0) break
      sabato.push(metaEMeta.pop())
    }
  }
  if (giovedi.length - sabato.length < 0) {
    console.log('g < s')
    for (let i = 0; i < sabato.length - giovedi.length; i++) {
      if (metaEMeta.length == 0) break
      giovedi.push(metaEMeta.pop())
    }
  }
  console.log('metaEMeta', metaEMeta)
  for (let i = 0; i < metaEMeta.length; i++) {
    console.log('g == s')
    if (i%2 == 0) {
      giovedi.push(metaEMeta[i])
    } else {
      sabato.push(metaEMeta[i])
    }
  }

  console.log('gio sab', giovedi, sabato)
  return [giovedi, sabato]

  
}

function calcolaPercentualeGiovedìHelper(gruppo, entita2giorno) {
  let contagiovedi = 0
  gruppo.forEach(enita => {
    contagiovedi = entita2giorno[enita] == 'Giovedì' ? contagiovedi + 1 : contagiovedi
  })
  return contagiovedi/gruppo.length
}

function creaSuggerimentoGruppi(affinità, entita2Peso) {
  console.log('ENTITA 2 PESO', entita2Peso)
  const numeroGruppi = 20
  let gruppi = [];

  // Crea una copia dei partecipanti
  let partecipanti = Object.keys(affinità);
  
  // Funzione per calcolare l'affinità totale di un gruppo
  function calcolaAffinitàGruppo(gruppo) {
    let affinitàTotale = 0;
    for (let i = 0; i < gruppo.length; i++) {
      for (let j = i + 1; j < gruppo.length; j++) {
        const affinità1 = affinità[gruppo[i]][gruppo[j]] || 0;
        const affinità2 = affinità[gruppo[j]][gruppo[i]] || 0;
        affinitàTotale += Math.min(affinità1, affinità2);
      }
    }
    return affinitàTotale;
  }

  // Funzione per trovare il miglior gruppo possibile
  function trovaMigliorGruppo(partecipantiDisponibili) {
    let migliorGruppo = [];
    let affinitàMinima = Infinity;

    // Genera tutti i gruppi di 4 partecipanti possibili
    for (let i = 0; i < partecipantiDisponibili.length; i++) {
      for (let j = i + 1; j < partecipantiDisponibili.length; j++) {
        for (let k = j + 1; k < partecipantiDisponibili.length; k++) {
          for (let l = k + 1; l < partecipantiDisponibili.length; l++) {
            let gruppo = [partecipantiDisponibili[i], partecipantiDisponibili[j], partecipantiDisponibili[k], partecipantiDisponibili[l]];
            const affinitàGruppo = calcolaAffinitàGruppo(gruppo);
            let totPeso = Number(entita2Peso[partecipantiDisponibili[i]]) + Number(entita2Peso[partecipantiDisponibili[j]]) + Number(entita2Peso[partecipantiDisponibili[k]]) + Number(entita2Peso[partecipantiDisponibili[l]])
            let entitada2 = []
            if (Number(entita2Peso[partecipantiDisponibili[i]]) == 2) entitada2.push(partecipantiDisponibili[i])
            if (Number(entita2Peso[partecipantiDisponibili[j]]) == 2) entitada2.push(partecipantiDisponibili[j])
            if (Number(entita2Peso[partecipantiDisponibili[k]]) == 2) entitada2.push(partecipantiDisponibili[k])
            if (Number(entita2Peso[partecipantiDisponibili[l]]) == 2) entitada2.push(partecipantiDisponibili[l])
            let entitada1 = []
            if (Number(entita2Peso[partecipantiDisponibili[i]]) == 1) entitada1.push(partecipantiDisponibili[i])
            if (Number(entita2Peso[partecipantiDisponibili[j]]) == 1) entitada1.push(partecipantiDisponibili[j])
            if (Number(entita2Peso[partecipantiDisponibili[k]]) == 1) entitada1.push(partecipantiDisponibili[k])
            if (Number(entita2Peso[partecipantiDisponibili[l]]) == 1) entitada1.push(partecipantiDisponibili[l])
            shuffle(entitada1)
            shuffle(entitada2)
            if (totPeso == 5) gruppo = gruppo.filter(e => e !== entitada1[0]);// rimuovere uno da 1
            if (totPeso == 6) gruppo = gruppo.filter(e => e !== entitada2[0]);// rimuovere uno da 2
            if (totPeso == 7) gruppo = gruppo.filter(e => e !== entitada2[0] && e !== entitada1[0]);// rimuovere uno da 2 e uno da 1
            if (totPeso == 8) gruppo = gruppo.filter(e => e !== entitada2[0] && e !== entitada2[0]);// rimuovere due da 2

            // Se l'affinità totale del gruppo è minore, salvalo come il miglior gruppo
            if (affinitàGruppo < affinitàMinima) {
              affinitàMinima = affinitàGruppo;
              migliorGruppo = gruppo;
            }
          }
        }
      }
    }
    return migliorGruppo;
  }

  // Crea gruppi fino a raggiungere il numero richiesto
  while (gruppi.length < 10) {
    if (partecipanti.length < 4) {
      partecipanti = Object.keys(affinità);
    }
    const gruppo = trovaMigliorGruppo(shuffle(partecipanti));
    gruppi.push(gruppo);

    // Rimuovi i membri del gruppo dai partecipanti disponibili
    partecipanti = partecipanti.filter(p => !gruppo.includes(p));

  }

  return gruppi;

}

function shuffle(array) {
  // Copia dell'array originale per non modificarlo
  const shuffledArray = [...array];
  
  // Itera dall'ultimo elemento all'inizio dell'array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
      // Estrai un indice casuale da 0 a i
      const j = Math.floor(Math.random() * (i + 1));
      
      // Scambia gli elementi in posizioni i e j
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray; // Restituisce l'array mescolato
}

export {
  keyBy,
  groupBy,
  groupByToSet,
  groupByToField,
  getData,
  getDataMock,
  calcolaAffinita,
  creaSuggerimentoGruppi,
  calcolaPreferenzeGiorno,
  definisciGruppiPerGiorno
}