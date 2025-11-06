
let map, marcadorAtual = null;
let dadosFiltrados = [];

function normalizarTexto(txt) {
  return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function validarEntrada(nome) {
  const regex = /^[A-Za-zÀ-ÿ\s]{3,}$/;
  return regex.test(nome.trim());
}

function iniciarPesquisa() {
  const nome = document.getElementById("nomeBuscaInicial").value.trim();
  if (!validarEntrada(nome)) {
    alert("Digite pelo menos 3 letras, apenas caracteres alfabéticos (sem números ou símbolos).");
    return;
  }

  document.getElementById("telaInicial").style.display = "none";
  document.getElementById("estruturaPrincipal").style.display = "flex";

  inicializarMapa();

  const termo = normalizarTexto(nome);
  dadosFiltrados = dados.filter(d => normalizarTexto(d.nome).includes(termo));

  atualizarLista(nome);

  const msgDiv = document.getElementById("mensagemResultado");
  const pesquisaInput = document.getElementById("pesquisaGroup");

  if (dadosFiltrados.length === 0) {
    msgDiv.innerText = "Nenhum nome foi encontrado.";
    pesquisaInput.style.display = "none";
  } else if (dadosFiltrados.length === 1) {
    msgDiv.innerText = "1 nome encontrado:";
    pesquisaInput.style.display = "none";
  } else {
    msgDiv.innerText = `${dadosFiltrados.length} nomes encontrados:`;
    pesquisaInput.style.display = "flex";
  }
}

function voltarTelaInicial() {
  document.getElementById("estruturaPrincipal").style.display = "none";
  document.getElementById("telaInicial").style.display = "flex";
  document.getElementById("nomeBuscaInicial").value = "";
  document.getElementById("lista").innerHTML = "";
  document.getElementById("pesquisa").value = "";
  document.getElementById("mensagemResultado").innerHTML = "";
  dadosFiltrados = [];
  if (marcadorAtual) {
    map.removeLayer(marcadorAtual);
    marcadorAtual = null;
  }
}

function inicializarMapa() {
  if (map) return;
  map = L.map('map');
  const bbox = [
    [-24.102093288167982, -48.365587592124946],
    [-24.100734434475196, -48.362594246864326]
  ];
  map.fitBounds(bbox);

//  L.tileLayer.provider('Jawg.Streets', {
  L.tileLayer.provider('OpenStreetMap.Mapnik', {
    maxZoom: 19,
	//attribution: '&copy; <a href="https://www.jawg.io">Jawg Maps</a> Dados do &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://mapaderibeirao.github.io/mapa/">EQA</a>',
	attribution: '&copy; Dados do &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://mapaderibeirao.github.io/mapa/">EQA</a>',
//	accessToken: 'nX1AM9W5grCQnzUA1TmAaPWYcOCjbm2lLOrnpDWxihLxM0IxeYWAbL5415DoYyUn'
  }).addTo(map);
}

function localizarCodigo(id) {
  const item = (dadosFiltrados.find(d => d.id === id) || dados.find(d => d.id === id));
  if (!item) return;

  if (marcadorAtual) map.removeLayer(marcadorAtual);

  marcadorAtual = L.marker([item.lat, item.lon]).addTo(map)
    .bindPopup(`<b>Número:</b> ${item.id}<br><b>Nome:</b> ${item.nome}<br><b>Endereço:</b> ${item.endereco}`)
    .openPopup();

  map.setView([item.lat, item.lon], 20);
}

const listaDiv = document.getElementById('lista');

function atualizarLista(filtro = '') {
  listaDiv.innerHTML = '';
  const termo = normalizarTexto(filtro);
  const base = dadosFiltrados.length ? dadosFiltrados : dados;
  base
    .filter(d => normalizarTexto(d.nome).includes(termo))
    .forEach(d => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center item';
      itemDiv.innerHTML = `
        <span>${d.nome}</span>
        <button class="btn btn-sm btn-primary" onclick="localizarCodigo(${d.id})">Localizar</button>
      `;
      listaDiv.appendChild(itemDiv);
    });
}

function filtrarLista() {
  const valor = document.getElementById('pesquisa').value;
  const termo = normalizarTexto(valor);
  const subconjunto = dadosFiltrados.filter(d => normalizarTexto(d.nome).includes(termo));
  listaDiv.innerHTML = '';
  subconjunto.forEach(d => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-group-item d-flex justify-content-between align-items-center item';
    itemDiv.innerHTML = `
      <span>${d.nome}</span>
      <button class="btn btn-sm btn-primary" onclick="localizarCodigo(${d.id})">Localizar</button>
    `;
    listaDiv.appendChild(itemDiv);
  });
}

// ENTER na busca inicial
document.getElementById("caixaBuscaInicial").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    iniciarPesquisa();
  }
});