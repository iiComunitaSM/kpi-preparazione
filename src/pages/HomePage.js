import './styles/HomePage.css';
import { useEffect, useState } from 'react';
import { getData, getDataMock, calcolaAffinita, creaSuggerimentoGruppi, groupByToField, calcolaPreferenzeGiorno, definisciGruppiPerGiorno } from './../utils'

import TableCustom from './../components/TableCustom';

const EXPIRATION_TIME = 6 * 60 * 60 * 1000;
function HomePage() {
  const now = new Date().getTime();
  const [entita, setEntita] = useState([])
  const [preparazioniData, setPreparazioniData] = useState([])
  const [tableRows, setTableRows] = useState([]);
  const [secondTableRows, setSecondTableRows] = useState([]);
  const [thirdTableRows, setThirdTableRows] = useState([]);
  const [thirdTableColumns, setThirdTableColumns] = useState([])
  const [gruppiSuggeriti, setGruppiSuggeriti] = useState({})


  useEffect(() => {
    getDataFromUtils()
  }, []);


  const getDataFromUtils = async () => {
    const dataFromStorage = JSON.parse(localStorage.getItem('data'));
    const entitaFromStorage = JSON.parse(localStorage.getItem('entita'));
    const savedTimestamp = localStorage.getItem('timestamp');

    const elapsedTime = now - parseInt(savedTimestamp, 10);
    let data = []
    let entita = []
    try {
      if (dataFromStorage == null || entitaFromStorage ==  null || elapsedTime > EXPIRATION_TIME) {
        [data, entita] = await getData()
        localStorage.setItem('data', JSON.stringify(data));
        localStorage.setItem('entita', JSON.stringify(entita));
        localStorage.setItem('timestamp', now.toString());
      } else {
        data = dataFromStorage
        entita = entitaFromStorage
      }
    } catch (error) {
      [data, entita] = getDataMock()
      localStorage.setItem('data', JSON.stringify(data));
      localStorage.setItem('entita', JSON.stringify(entita));
      localStorage.setItem('timestamp', now.toString());
      console.error(error)
    }
    const rows = []
    data.forEach(prep => rows.push(createRowPreparazione(prep.giorno, prep.weekday, prep.parola, prep.listaEntita.join(', '))))
    console.log('ENTITA', entita)
    //Calcola KPI
    let kpis = []
    entita.forEach(ent => {
      let numeroPreparazioniTotali = 0
      let numeroPreparazioniGiovedi = 0
      let numeroPreparazioniSabato = 0
      let entita2NumeroVoltePreparatoInsieme = {}
      rows.forEach(row => {
        if (row.entita.split(', ').includes(ent.nome)) {
          numeroPreparazioniTotali = numeroPreparazioniTotali + 1
          numeroPreparazioniGiovedi = row.weekday == 'Giovedì' ? numeroPreparazioniGiovedi + 1 : numeroPreparazioniGiovedi
          numeroPreparazioniSabato = row.weekday == 'Sabato' ? numeroPreparazioniSabato + 1 : numeroPreparazioniSabato
          row.entita.split(', ').forEach(collab => {
            if(collab != ent.nome) {
              if (!entita2NumeroVoltePreparatoInsieme.hasOwnProperty(collab)) {
                entita2NumeroVoltePreparatoInsieme[collab] = 0
              }
              entita2NumeroVoltePreparatoInsieme[collab] = entita2NumeroVoltePreparatoInsieme[collab] + 1
            }
          })
        }
      })
      //ordino l'oggetto entita - numero partecipazioni insieme
      let listaTuttiNomi = entita.map(e => e.nome)
      let matrixArray = Object.entries(entita2NumeroVoltePreparatoInsieme);
      matrixArray.sort((a, b) => {return b[1] - a[1]})
      let sorted = []
      matrixArray.forEach(e => sorted.push({nome: e[0], times: e[1]}))
      listaTuttiNomi.forEach(e => {
        if(!sorted.map(s => s.nome).includes(e) && e != ent.nome) {
          sorted.push({nome: e, times: 0})
        }
      })

      kpis[ent.nome] = {
        nome: ent.nome,
        tot: numeroPreparazioniTotali,
        gio: numeroPreparazioniGiovedi,
        sab: numeroPreparazioniSabato,
        meno: sorted.slice(-3).map(e => e.nome).join(', '),
        piu: sorted.slice(0, 3).map(e => e.nome).join(', '),
        matrix: sorted
      }
    })
    console.log('KPI', kpis)
    let secondTableRows = []
    let thirdTableRows = []
    let columnsThirdTable = [
      { id: 'nome', label: '', minWidth: 130, strong: true}
    ]
    Object.values(kpis).forEach(kpi => secondTableRows.push(createRowKPI(kpi.nome, kpi.tot, kpi.gio, kpi.sab, kpi.meno, kpi.piu)))
    Object.values(kpis).forEach(kpi => {
      columnsThirdTable.push({ id: kpi.nome, label: kpi.nome,  minWidth: 100 })
      let currentFields = {}
      currentFields.nome = kpi.nome
      currentFields[kpi.nome] = 'N/A'
      kpi.matrix.forEach(m => currentFields[m.nome] = m.times)
      thirdTableRows.push(currentFields)
    })
    let soloEntitaAttive = entita.filter(e => e.active == true)
    let kpisSoloAttivi = {}
    soloEntitaAttive.forEach(e => kpisSoloAttivi[e.nome] = kpis[e.nome])
    console.log('SOLO ATTIBI', soloEntitaAttive)
    let affinita = calcolaAffinita(kpisSoloAttivi)
    let gruppi = creaSuggerimentoGruppi(affinita, groupByToField(entita, 'nome', 'peso'))
    let [gruppoG, gruppoS] = definisciGruppiPerGiorno(gruppi, calcolaPreferenzeGiorno(kpisSoloAttivi))
    console.log('GRS', gruppoS)
    console.log('GRSG', gruppoG)
    console.log('AFF',affinita)
    console.log('GRUPP', gruppi)
    setGruppiSuggeriti({
      giovedi: [...gruppoG],
      sabato: [...gruppoS]
    })
    console.log('gruppi sugg', gruppiSuggeriti)
    setTableRows(rows)
    setSecondTableRows(secondTableRows)
    setThirdTableRows(thirdTableRows)
    setThirdTableColumns(columnsThirdTable)
  } 

  function createRowPreparazione(giorno, weekday, parola, entita) {
    return { giorno, weekday, parola, entita };
  }

  function createRowKPI(nome, totPreparazioni, PreparazioniG, PreparazioniS, entitaMeno, entitaPiu) {
    return { nome, totPreparazioni, PreparazioniG, PreparazioniS, entitaMeno, entitaPiu};
  }

  const columns = [
    { id: 'giorno', label: 'Giorno', minWidth: 170, strong: true },
    { id: 'weekday', label: 'Weekday', minWidth: 100 },
    { id: 'parola', label: 'Parola', minWidth: 170 },
    { id: 'entita', label: 'Partecipanti', minWidth: 170 }
  ];

  const columns2 = [
    { id: 'nome', label: 'Nome', minWidth: 170, strong: true },
    { id: 'totPreparazioni', label: 'TOT Prep', minWidth: 50 },
    { id: 'PreparazioniG', label: '#Giovedì', minWidth: 50 },
    { id: 'PreparazioniS', label: '#Sabato', minWidth: 50 },
    { id: 'entitaMeno', label: '3 Persone con cui ha preparato di meno', minWidth: 200 },
    { id: 'entitaPiu', label: '3 Persone con cui ha preparato di più', minWidth: 200 }
  ];


  return (
    <div className='HomePage'>
      <div className='title'>Preparazioni</div>
      <TableCustom columns={columns} tableRows={tableRows} />
      <div className='title'>KPI di ogni Persona/Coppia</div>
      <TableCustom columns={columns2} tableRows={secondTableRows} />
      <div className='title'>Matrice di preparazione</div>
      <TableCustom columns={thirdTableColumns} tableRows={thirdTableRows} />
      {gruppiSuggeriti.hasOwnProperty('giovedi') && 
      <div className='suggerimenti'>
        <div>
        <div className='subtitle'>Gruppi suggeriti per il Giovedì</div>
          <div className='container'>
            {gruppiSuggeriti.giovedi.map(g => {
              return <div className='item' key={g.join(',')}>{g.join(', ')}</div>
            })}
          </div>
        </div>
        <div>
        <div className='subtitle'>Gruppi suggeriti per il Sabato</div>
          <div className='container'>
            {gruppiSuggeriti.sabato.map(g => {
              return <div className='item' key={g.join(',')}>{g.join(', ')}</div>
            })}
        </div> 
        </div>
      </div>}
    </div>
  );
}

export default HomePage;
