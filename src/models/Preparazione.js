import firebase from "firebase/compat/app";
import moment from "moment";

class Preparazione {
  
  constructor(data, parola, id) {
    const  dateOptions = {year: 'numeric', month: 'short', day: 'numeric'};
    this.id = id
    this.giorno = new Date(data * 1000).toLocaleDateString('it-IT', dateOptions);
    this.giornoDateFormat = new Date(data * 1000)
    this.parola = parola
    this.weekday = this.giornoDateFormat.getDay() == 6 ? 'Sabato' : 'Giovedì';
  }

}

export default Preparazione;
