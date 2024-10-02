class Entita {
  
  constructor(nome, peso, id, active) {
    console.log('NOME', nome, 'ACTIVE', active)
    this.id = id
    this.nome = nome;
    this.peso = peso;
    this.active = active == null || active == undefined
  }

}

export default Entita;
