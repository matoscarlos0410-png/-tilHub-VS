"use strict";

/* =========================================================
   ÚTILHUB V14
   SUPRIME-MASTER-NOVA
   SIN IA · SIN BACKEND
========================================================= */

const STORAGE_KEY = "utilhub-v14";

const defaultState = {
  theme: "dark",
  animations: true,
  favorites: [],
  recent: [],
  notes: [],
  tasks: [],
  shopping: [],
  study: [],
  currency: {}
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return {
      ...defaultState,
      ...(saved || {})
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}


/* =========================================================
   HERRAMIENTAS
========================================================= */

const tools = [

  {
    id: "calculator",
    name: "Calculadora",
    icon: "🧮",
    category: "Cálculo",
    description: "Realiza operaciones matemáticas."
  },

  {
    id: "percentage",
    name: "Porcentajes",
    icon: "％",
    category: "Cálculo",
    description: "Calcula porcentajes rápidamente."
  },

  {
    id: "discount",
    name: "Descuentos",
    icon: "🏷️",
    category: "Cálculo",
    description: "Calcula precios con descuento."
  },

  {
    id: "rule3",
    name: "Regla de 3",
    icon: "📐",
    category: "Cálculo",
    description: "Resuelve reglas de tres."
  },

  {
    id: "length",
    name: "Longitud",
    icon: "📏",
    category: "Conversión",
    description: "Convierte unidades de longitud."
  },

  {
    id: "weight",
    name: "Peso",
    icon: "⚖️",
    category: "Conversión",
    description: "Convierte unidades de peso."
  },

  {
    id: "volume",
    name: "Volumen",
    icon: "🧪",
    category: "Conversión",
    description: "Convierte unidades de volumen."
  },

  {
    id: "timeconvert",
    name: "Tiempo",
    icon: "⏱️",
    category: "Conversión",
    description: "Convierte unidades de tiempo."
  },

  {
    id: "temperature",
    name: "Temperatura",
    icon: "🌡️",
    category: "Conversión",
    description: "Convierte Celsius, Fahrenheit y Kelvin."
  },

  {
    id: "currency",
    name: "Moneda",
    icon: "💱",
    category: "Conversión",
    description: "Consulta tipos de cambio."
  },

  {
    id: "date",
    name: "Diferencia de fechas",
    icon: "📅",
    category: "Tiempo",
    description: "Calcula días entre dos fechas."
  },

  {
    id: "age",
    name: "Edad",
    icon: "🎂",
    category: "Tiempo",
    description: "Calcula una edad aproximada."
  },

  {
    id: "timer",
    name: "Temporizador",
    icon: "⏳",
    category: "Tiempo",
    description: "Cuenta hacia atrás."
  },

  {
    id: "stopwatch",
    name: "Cronómetro",
    icon: "⏱️",
    category: "Tiempo",
    description: "Mide el tiempo transcurrido."
  },

  {
    id: "password",
    name: "Contraseña",
    icon: "🔐",
    category: "Seguridad",
    description: "Genera contraseñas aleatorias."
  },

  {
    id: "random",
    name: "Aleatorio",
    icon: "🎲",
    category: "Utilidades",
    description: "Genera números o lanza dados."
  },

  {
    id: "qr",
    name: "Código QR",
    icon: "▦",
    category: "Utilidades",
    description: "Crea códigos QR."
  },

  {
    id: "text",
    name: "Texto",
    icon: "🔤",
    category: "Texto",
    description: "Herramientas para transformar texto."
  },

  {
    id: "dictionary",
    name: "Diccionario",
    icon: "📖",
    category: "Texto",
    description: "Busca definiciones."
  },

  {
    id: "notes",
    name: "Notas",
    icon: "📝",
    category: "Organización",
    description: "Guarda notas localmente."
  }

];


const categories = [
  "Todas",
  ...new Set(tools.map(tool => tool.category))
];

let currentCategory = "Todas";


/* =========================================================
   ELEMENTOS
========================================================= */

const toolGrid = document.getElementById("toolGrid");
const filters = document.getElementById("filters");
const globalSearch = document.getElementById("globalSearch");
const searchResults = document.getElementById("searchResults");

const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

const toast = document.getElementById("toast");

const favCount = document.getElementById("favCount");
const recentCount = document.getElementById("recentCount");
const toolCount = document.getElementById("toolCount");
const onlineStatus = document.getElementById("onlineStatus");


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =========================================================
   MODAL
========================================================= */

function openModal(content) {

  modalContent.innerHTML = content;
  modal.hidden = false;

  document.body.style.overflow = "hidden";
}

function closeModal() {

  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close]").forEach(el => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeModal();
  }

});


/* =========================================================
   RENDER
========================================================= */

function renderFilters() {

  filters.innerHTML = categories
    .map(category => `
      <button
        class="filter-btn ${category === currentCategory ? "active" : ""}"
        data-category="${category}"
      >
        ${category}
      </button>
    `)
    .join("");

  filters.querySelectorAll(".filter-btn")
    .forEach(button => {

      button.addEventListener("click", () => {

        currentCategory =
          button.dataset.category;

        renderFilters();
        renderTools();

      });

    });

}


function renderTools() {

  let visible = tools;

  if (currentCategory !== "Todas") {

    visible = visible.filter(
      tool => tool.category === currentCategory
    );

  }

  toolGrid.innerHTML = visible
    .map(tool => toolCard(tool))
    .join("");

  toolGrid
    .querySelectorAll(".tool-card")
    .forEach(card => {

      card.addEventListener("click", event => {

        if (
          event.target.closest(".favorite")
        ) {
          return;
        }

        openTool(card.dataset.tool);

      });

    });

  toolGrid
    .querySelectorAll(".favorite")
    .forEach(button => {

      button.addEventListener("click", event => {

        event.stopPropagation();

        toggleFavorite(button.dataset.id);

      });

    });

}


function toolCard(tool) {

  const favorite =
    state.favorites.includes(tool.id);

  return `
    <article
      class="tool-card"
      data-tool="${tool.id}"
    >

      <button
        class="favorite ${favorite ? "active" : ""}"
        data-id="${tool.id}"
        title="Favorito"
      >
        ${favorite ? "★" : "☆"}
      </button>

      <div class="tool-icon">
        ${tool.icon}
      </div>

      <h3>
        ${tool.name}
      </h3>

      <p>
        ${tool.description}
      </p>

    </article>
  `;
}


/* =========================================================
   FAVORITOS
========================================================= */

function toggleFavorite(id) {

  if (state.favorites.includes(id)) {

    state.favorites =
      state.favorites.filter(
        item => item !== id
      );

    showToast("Quitado de favoritos");

  } else {

    state.favorites.push(id);

    showToast("Añadido a favoritos");

  }

  saveState();
  updateStats();
  renderTools();
}


function addRecent(id) {

  state.recent =
    state.recent.filter(
      item => item !== id
    );

  state.recent.unshift(id);

  state.recent =
    state.recent.slice(0, 10);

  saveState();
  updateStats();
}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function updateStats() {

  toolCount.textContent =
    tools.length;

  favCount.textContent =
    state.favorites.length;

  recentCount.textContent =
    state.recent.length;

  onlineStatus.textContent =
    navigator.onLine ? "●" : "○";
}

window.addEventListener("online", updateStats);
window.addEventListener("offline", updateStats);


/* =========================================================
   BUSCADOR
========================================================= */

globalSearch.addEventListener("input", () => {

  const query =
    globalSearch.value.trim().toLowerCase();

  if (!query) {

    searchResults.innerHTML = "";
    return;

  }

  const results =
    tools.filter(tool =>
      `${tool.name} ${tool.description} ${tool.category}`
        .toLowerCase()
        .includes(query)
    );

  searchResults.innerHTML =
    results.map(tool => `
      <div
        class="search-result"
        data-tool="${tool.id}"
      >
        ${tool.icon}
        <b>${tool.name}</b>
        <small> · ${tool.category}</small>
      </div>
    `).join("");

  searchResults
    .querySelectorAll(".search-result")
    .forEach(result => {

      result.addEventListener("click", () => {

        globalSearch.value = "";
        searchResults.innerHTML = "";

        openTool(result.dataset.tool);

      });

    });

});


/* =========================================================
   ABRIR HERRAMIENTA
========================================================= */

function openTool(id) {

  addRecent(id);

  const tool =
    tools.find(item => item.id === id);

  if (!tool) return;

  const functions = {
    calculator: calculatorUI,
    percentage: percentageUI,
    discount: discountUI,
    rule3: rule3UI,
    length: lengthUI,
    weight: weightUI,
    volume: volumeUI,
    timeconvert: timeConvertUI,
    temperature: temperatureUI,
    currency: currencyUI,
    date: dateUI,
    age: ageUI,
    timer: timerUI,
    stopwatch: stopwatchUI,
    password: passwordUI,
    random: randomUI,
    qr: qrUI,
    text: textUI,
    dictionary: dictionaryUI,
    notes: notesUI
  };

  if (functions[id]) {
    functions[id]();
  }

}


/* =========================================================
   CALCULADORA
========================================================= */

function calculatorUI() {

  openModal(`
    <h2>🧮 Calculadora</h2>

    <div class="form-group">
      <label>Operación</label>

      <input
        id="calcInput"
        placeholder="Ej.: 25 * 4 + 10 / 2"
      >
    </div>

    <br>

    <button
      class="form-button"
      id="calcBtn"
    >
      Calcular
    </button>

    <div id="calcResult"></div>
  `);

  document
    .getElementById("calcBtn")
    .addEventListener("click", () => {

      const input =
        document.getElementById("calcInput").value;

      try {

        const expression =
          input.replace(/[^0-9+\-*/().%\s]/g, "");

        const result =
          Function(
            `"use strict"; return (${expression})`
          )();

        document.getElementById("calcResult").innerHTML = `
          <div class="result">
            <div class="big-result">
              ${result}
            </div>
          </div>
        `;

      } catch {

        showToast("Operación no válida");

      }

    });

}


/* =========================================================
   PORCENTAJES
========================================================= */

function percentageUI() {

  openModal(`
    <h2>％ Porcentajes</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Porcentaje</label>
        <input id="percentValue" type="number">
      </div>

      <div class="form-group">
        <label>De</label>
        <input id="percentBase" type="number">
      </div>

    </div>

    <br>

    <button class="form-button" id="percentBtn">
      Calcular
    </button>

    <div id="percentResult"></div>
  `);

  document
    .getElementById("percentBtn")
    .addEventListener("click", () => {

      const p =
        Number(document.getElementById("percentValue").value);

      const base =
        Number(document.getElementById("percentBase").value);

      const result =
        base * p / 100;

      document.getElementById("percentResult").innerHTML = `
        <div class="result">
          <div class="big-result">${result}</div>
        </div>
      `;

    });

}


/* =========================================================
   DESCUENTO
========================================================= */

function discountUI() {

  openModal(`
    <h2>🏷️ Descuentos</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Precio</label>
        <input id="discountPrice" type="number">
      </div>

      <div class="form-group">
        <label>Descuento %</label>
        <input id="discountPercent" type="number">
      </div>

    </div>

    <br>

    <button class="form-button" id="discountBtn">
      Calcular
    </button>

    <div id="discountResult"></div>
  `);

  document
    .getElementById("discountBtn")
    .addEventListener("click", () => {

      const price =
        Number(document.getElementById("discountPrice").value);

      const percent =
        Number(document.getElementById("discountPercent").value);

      const saved =
        price * percent / 100;

      const finalPrice =
        price - saved;

      document.getElementById("discountResult").innerHTML = `
        <div class="result">
          Ahorras: <b>${saved.toFixed(2)}</b>
          <br><br>
          Precio final:
          <div class="big-result">
            ${finalPrice.toFixed(2)}
          </div>
        </div>
      `;

    });

}


/* =========================================================
   REGLA DE 3
========================================================= */

function rule3UI() {

  openModal(`
    <h2>📐 Regla de 3</h2>

    <p>
      Si A corresponde a B,
      ¿cuánto corresponde a C?
    </p>

    <div class="form-grid">

      <div class="form-group">
        <label>A</label>
        <input id="rA" type="number">
      </div>

      <div class="form-group">
        <label>B</label>
        <input id="rB" type="number">
      </div>

      <div class="form-group">
        <label>C</label>
        <input id="rC" type="number">
      </div>

    </div>

    <br>

    <button class="form-button" id="rBtn">
      Resolver
    </button>

    <div id="rResult"></div>
  `);

  document
    .getElementById("rBtn")
    .addEventListener("click", () => {

      const A = Number(document.getElementById("rA").value);
      const B = Number(document.getElementById("rB").value);
      const C = Number(document.getElementById("rC").value);

      if (A === 0) {
        showToast("A no puede ser 0");
        return;
      }

      const X = B * C / A;

      document.getElementById("rResult").innerHTML = `
        <div class="result">
          Resultado:
          <div class="big-result">
            ${X}
          </div>
        </div>
      `;

    });

}


/* =========================================================
   CONVERSIONES
========================================================= */

const conversionUnits = {

  length: {
    m: 1,
    km: 1000,
    cm: .01,
    mm: .001,
    mi: 1609.344,
    ft: .3048
  },

  weight: {
    kg: 1,
    g: .001,
    mg: .000001,
    lb: .45359237
  },

  volume: {
    l: 1,
    ml: .001,
    m3: 1000,
    gal: 3.785411784
  },

  timeconvert: {
    s: 1,
    min: 60,
    h: 3600,
    day: 86400
  }

};


function conversionUI(type, title, icon) {

  const units =
    Object.keys(conversionUnits[type]);

  openModal(`
    <h2>${icon} ${title}</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Cantidad</label>
        <input id="convValue" type="number" value="1">
      </div>

      <div class="form-group">
        <label>Desde</label>

        <select id="convFrom">
          ${units.map(u => `<option value="${u}">${u}</option>`).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Hacia</label>

        <select id="convTo">
          ${units.map(u => `<option value="${u}">${u}</option>`).join("")}
        </select>
      </div>

    </div>

    <br>

    <button class="form-button" id="convBtn">
      Convertir
    </button>

    <div id="convResult"></div>
  `);

  document
    .getElementById("convBtn")
    .addEventListener("click", () => {

      const value =
        Number(document.getElementById("convValue").value);

      const from =
        document.getElementById("convFrom").value;

      const to =
        document.getElementById("convTo").value;

      const base =
        value * conversionUnits[type][from];

      const result =
        base / conversionUnits[type][to];

      document.getElementById("convResult").innerHTML = `
        <div class="result">
          <div class="big-result">
            ${result}
          </div>
        </div>
      `;

    });

}


function lengthUI() {
  conversionUI("length", "Longitud", "📏");
}

function weightUI() {
  conversionUI("weight", "Peso", "⚖️");
}

function volumeUI() {
  conversionUI("volume", "Volumen", "🧪");
}

function timeConvertUI() {
  conversionUI("timeconvert", "Tiempo", "⏱️");
}


/* =========================================================
   TEMPERATURA
========================================================= */

function temperatureUI() {

  openModal(`
    <h2>🌡️ Temperatura</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Cantidad</label>
        <input id="tempValue" type="number">
      </div>

      <div class="form-group">
        <label>Desde</label>

        <select id="tempFrom">
          <option value="C">Celsius</option>
          <option value="F">Fahrenheit</option>
          <option value="K">Kelvin</option>
        </select>
      </div>

      <div class="form-group">
        <label>Hacia</label>

        <select id="tempTo">
          <option value="C">Celsius</option>
          <option value="F">Fahrenheit</option>
          <option value="K">Kelvin</option>
        </select>
      </div>

    </div>

    <br>

    <button class="form-button" id="tempBtn">
      Convertir
    </button>

    <div id="tempResult"></div>
  `);

  document
    .getElementById("tempBtn")
    .addEventListener("click", () => {

      const value =
        Number(document.getElementById("tempValue").value);

      const from =
        document.getElementById("tempFrom").value;

      const to =
        document.getElementById("tempTo").value;

      let celsius;

      if (from === "C") {
        celsius = value;
      }

      if (from === "F") {
        celsius = (value - 32) * 5 / 9;
      }

      if (from === "K") {
        celsius = value - 273.15;
      }

      let result;

      if (to === "C") {
        result = celsius;
      }

      if (to === "F") {
        result = celsius * 9 / 5 + 32;
      }

      if (to === "K") {
        result = celsius + 273.15;
      }

      document.getElementById("tempResult").innerHTML = `
        <div class="result">
          <div class="big-result">
            ${result.toFixed(3)}
          </div>
        </div>
      `;

    });

}


/* =========================================================
   MONEDA
========================================================= */

async function currencyUI() {

  openModal(`
    <h2>💱 Conversor de moneda</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Cantidad</label>
        <input id="currencyValue" type="number" value="1">
      </div>

      <div class="form-group">
        <label>Desde</label>
        <input id="currencyFrom" value="PEN">
      </div>

      <div class="form-group">
        <label>Hacia</label>
        <input id="currencyTo" value="USD">
      </div>

    </div>

    <br>

    <button class="form-button" id="currencyBtn">
      Consultar
    </button>

    <div id="currencyResult"></div>
  `);

  document
    .getElementById("currencyBtn")
    .addEventListener("click", async () => {

      const amount =
        Number(document.getElementById("currencyValue").value);

      const from =
        document.getElementById("currencyFrom").value
          .trim()
          .toUpperCase();

      const to =
        document.getElementById("currencyTo").value
          .trim()
          .toUpperCase();

      const resultBox =
        document.getElementById("currencyResult");

      resultBox.innerHTML =
        `<div class="result">Consultando...</div>`;

      try {

        const response =
          await fetch(
            `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`
          );

        const data =
          await response.json();

        if (!data.rates || !data.rates[to]) {
          throw new Error("Moneda no encontrada");
        }

        const rate =
          data.rates[to];

        const result =
          amount * rate;

        state.currency = {
          from,
          to,
          rate,
          updated: Date.now()
        };

        saveState();

        resultBox.innerHTML = `
          <div class="result">

            <div class="big-result">
              ${result.toFixed(4)} ${to}
            </div>

            <p>
              1 ${from} = ${rate} ${to}
            </p>

          </div>
        `;

      } catch {

        const cached = state.currency;

        if (
          cached &&
          cached.from === from &&
          cached.to === to
        ) {

          const result =
            amount * cached.rate;

          resultBox.innerHTML = `
            <div class="result">

              Sin conexión. Usando
              la última tasa guardada.

              <div class="big-result">
                ${result.toFixed(4)} ${to}
              </div>

            </div>
          `;

        } else {

          resultBox.innerHTML =
            `<div class="result">
              No se pudo consultar la tasa.
              Comprueba tu conexión.
            </div>`;

        }

      }

    });

}


/* =========================================================
   FECHAS
========================================================= */

function dateUI() {

  openModal(`
    <h2>📅 Diferencia de fechas</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Fecha inicial</label>
        <input id="dateA" type="date">
      </div>

      <div class="form-group">
        <label>Fecha final</label>
        <input id="dateB" type="date">
      </div>

    </div>

    <br>

    <button class="form-button" id="dateBtn">
      Calcular
    </button>

    <div id="dateResult"></div>
  `);

  document
    .getElementById("dateBtn")
    .addEventListener("click", () => {

      const a =
        new Date(document.getElementById("dateA").value);

      const b =
        new Date(document.getElementById("dateB").value);

      if (
        Number.isNaN(a.getTime()) ||
        Number.isNaN(b.getTime())
      ) {
        showToast("Selecciona ambas fechas");
        return;
      }

      const days =
        Math.abs(
          b.getTime() - a.getTime()
        ) / 86400000;

      document.getElementById("dateResult").innerHTML = `
        <div class="result">
          <div class="big-result">
            ${Math.round(days)}
          </div>

          días de diferencia
        </div>
      `;

    });

}


/* =========================================================
   EDAD
========================================================= */

function ageUI() {

  openModal(`
    <h2>🎂 Calculadora de edad</h2>

    <div class="form-group">
      <label>Fecha de nacimiento</label>
      <input id="birthDate" type="date">
    </div>

    <br>

    <button class="form-button" id="ageBtn">
      Calcular edad
    </button>

    <div id="ageResult"></div>
  `);

  document
    .getElementById("ageBtn")
    .addEventListener("click", () => {

      const birth =
        new Date(
          document.getElementById("birthDate").value
        );

      if (Number.isNaN(birth.getTime())) {
        showToast("Selecciona una fecha");
        return;
      }

      const now = new Date();

      let age =
        now.getFullYear() -
        birth.getFullYear();

      const month =
        now.getMonth() -
        birth.getMonth();

      if (
        month < 0 ||
        (
          month === 0 &&
          now.getDate() < birth.getDate()
        )
      ) {
        age--;
      }

      document.getElementById("ageResult").innerHTML = `
        <div class="result">
          Tu edad aproximada es:

          <div class="big-result">
            ${age} años
          </div>
        </div>
      `;

    });

}


/* =========================================================
   TEMPORIZADOR
========================================================= */

let timerInterval = null;
let timerEnd = 0;

function timerUI() {

  openModal(`
    <h2>⏳ Temporizador</h2>

    <div class="form-group">
      <label>Segundos</label>
      <input
        id="timerSeconds"
        type="number"
        min="1"
        value="60"
      >
    </div>

    <br>

    <button class="form-button" id="timerStart">
      Iniciar
    </button>

    <button class="form-button" id="timerStop">
      Detener
    </button>

    <div class="result">

      <div
        id="timerDisplay"
        class="big-result"
      >
        00:00
      </div>

    </div>
  `);

  const display =
    document.getElementById("timerDisplay");

  document
    .getElementById("timerStart")
    .addEventListener("click", () => {

      clearInterval(timerInterval);

      const seconds =
        Number(
          document.getElementById("timerSeconds").value
        );

      timerEnd =
        Date.now() + seconds * 1000;

      timerInterval =
        setInterval(() => {

          const remaining =
            Math.max(
              0,
              timerEnd - Date.now()
            );

          const totalSeconds =
            Math.ceil(remaining / 1000);

          const min =
            Math.floor(totalSeconds / 60);

          const sec =
            totalSeconds % 60;

          display.textContent =
            `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;

          if (remaining <= 0) {

            clearInterval(timerInterval);

            showToast("⏰ ¡Tiempo terminado!");

          }

        }, 100);

    });


  document
    .getElementById("timerStop")
    .addEventListener("click", () => {

      clearInterval(timerInterval);

      showToast("Temporizador detenido");

    });

}


/* =========================================================
   CRONÓMETRO
========================================================= */

let stopwatchInterval = null;
let stopwatchStart = 0;
let stopwatchElapsed = 0;

function stopwatchUI() {

  openModal(`
    <h2>⏱️ Cronómetro</h2>

    <div class="result">

      <div
        id="stopwatchDisplay"
        class="big-result"
      >
        00:00:00
      </div>

    </div>

    <br>

    <button class="form-button" id="swStart">
      Iniciar
    </button>

    <button class="form-button" id="swPause">
      Pausar
    </button>

    <button class="form-button" id="swReset">
      Reiniciar
    </button>
  `);

  const display =
    document.getElementById("stopwatchDisplay");

  function update() {

    const elapsed =
      stopwatchElapsed +
      (
        stopwatchStart
          ? Date.now() - stopwatchStart
          : 0
      );

    const total =
      Math.floor(elapsed / 1000);

    const h =
      Math.floor(total / 3600);

    const m =
      Math.floor((total % 3600) / 60);

    const s =
      total % 60;

    display.textContent =
      `${String(h).padStart(2,"0")}:` +
      `${String(m).padStart(2,"0")}:` +
      `${String(s).padStart(2,"0")}`;

  }

  document
    .getElementById("swStart")
    .addEventListener("click", () => {

      if (stopwatchStart) return;

      stopwatchStart =
        Date.now();

      stopwatchInterval =
        setInterval(update, 250);

    });


  document
    .getElementById("swPause")
    .addEventListener("click", () => {

      if (!stopwatchStart) return;

      stopwatchElapsed +=
        Date.now() - stopwatchStart;

      stopwatchStart = 0;

      clearInterval(stopwatchInterval);

      update();

    });


  document
    .getElementById("swReset")
    .addEventListener("click", () => {

      stopwatchStart = 0;
      stopwatchElapsed = 0;

      clearInterval(stopwatchInterval);

      update();

    });

}


/* =========================================================
   CONTRASEÑAS
========================================================= */

function secureRandom(max) {

  const array =
    new Uint32Array(1);

  crypto.getRandomValues(array);

  return array[0] % max;
}


function generatePassword(length) {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" +
    "abcdefghijkmnopqrstuvwxyz" +
    "23456789!@#$%&*";

  let password = "";

  for (let i = 0; i < length; i++) {

    password +=
      chars[secureRandom(chars.length)];

  }

  return password;
}


function passwordUI() {

  openModal(`
    <h2>🔐 Generador de contraseñas</h2>

    <div class="form-group">

      <label>
        Longitud
      </label>

      <input
        id="passwordLength"
        type="number"
        min="6"
        max="64"
        value="16"
      >

    </div>

    <br>

    <button
      class="form-button"
      id="passwordBtn"
    >
      Generar
    </button>

    <div id="passwordResult"></div>
  `);

  document
    .getElementById("passwordBtn")
    .addEventListener("click", () => {

      const length =
        Math.min(
          64,
          Math.max(
            6,
            Number(
              document.getElementById("passwordLength").value
            )
          )
        );

      const password =
        generatePassword(length);

      document.getElementById("passwordResult").innerHTML = `
        <div class="result">

          <div class="big-result">
            ${password}
          </div>

          <br>

          <button
            class="form-button"
            id="copyPassword"
          >
            Copiar
          </button>

        </div>
      `;

      document
        .getElementById("copyPassword")
        .addEventListener("click", async () => {

          await navigator.clipboard.writeText(password);

          showToast("Contraseña copiada");

        });

    });

}


/* =========================================================
   ALEATORIO
========================================================= */

function randomUI() {

  openModal(`
    <h2>🎲 Aleatorio</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Mínimo</label>
        <input id="randomMin" type="number" value="1">
      </div>

      <div class="form-group">
        <label>Máximo</label>
        <input id="randomMax" type="number" value="100">
      </div>

    </div>

    <br>

    <button
      class="form-button"
      id="randomBtn"
    >
      Generar
    </button>

    <button
      class="form-button"
      id="diceBtn"
    >
      🎲 Lanzar dado
    </button>

    <div id="randomResult"></div>
  `);

  document
    .getElementById("randomBtn")
    .addEventListener("click", () => {

      const min =
        Number(
          document.getElementById("randomMin").value
        );

      const max =
        Number(
          document.getElementById("randomMax").value
        );

      const result =
        Math.floor(
          Math.random() *
          (max - min + 1)
        ) + min;

      document.getElementById("randomResult").innerHTML = `
        <div class="result">
          <div class="big-result">${result}</div>
        </div>
      `;

    });


  document
    .getElementById("diceBtn")
    .addEventListener("click", () => {

      const result =
        Math.floor(
          Math.random() * 6
        ) + 1;

      document.getElementById("randomResult").innerHTML = `
        <div class="result">
          🎲 Resultado:

          <div class="big-result">
            ${result}
          </div>
        </div>
      `;

    });

}


/* =========================================================
   QR
========================================================= */

function qrUI() {

  openModal(`
    <h2>▦ Generador QR</h2>

    <div class="form-group">

      <label>
        Texto o enlace
      </label>

      <input
        id="qrText"
        placeholder="Escribe algo..."
      >

    </div>

    <br>

    <button
      class="form-button"
      id="qrBtn"
    >
      Crear QR
    </button>

    <div
      id="qrResult"
      class="result"
    ></div>
  `);

  document
    .getElementById("qrBtn")
    .addEventListener("click", () => {

      const text =
        document.getElementById("qrText").value.trim();

      if (!text) {
        showToast("Escribe un texto");
        return;
      }

      const url =
        "https://api.qrserver.com/v1/create-qr-code/" +
        `?size=300x300&data=${encodeURIComponent(text)}`;

      document.getElementById("qrResult").innerHTML = `
        <img
          src="${url}"
          alt="Código QR"
          style="
            max-width:300px;
            width:100%;
            border-radius:15px;
            background:white;
            padding:10px;
          "
        >
      `;

    });

}


/* =========================================================
   TEXTO
========================================================= */

function textUI() {

  openModal(`
    <h2>🔤 Herramientas de texto</h2>

    <div class="form-group">

      <label>
        Texto
      </label>

      <textarea
        id="textInput"
        placeholder="Escribe aquí..."
      ></textarea>

    </div>

    <br>

    <button class="form-button" id="upperBtn">
      MAYÚSCULAS
    </button>

    <button class="form-button" id="lowerBtn">
      minúsculas
    </button>

    <button class="form-button" id="countBtn">
      Contar
    </button>

    <div id="textResult"></div>
  `);

  const input =
    document.getElementById("textInput");

  const result =
    document.getElementById("textResult");


  document
    .getElementById("upperBtn")
    .addEventListener("click", () => {

      input.value =
        input.value.toUpperCase();

    });


  document
    .getElementById("lowerBtn")
    .addEventListener("click", () => {

      input.value =
        input.value.toLowerCase();

    });


  document
    .getElementById("countBtn")
    .addEventListener("click", () => {

      const text =
        input.value;

      result.innerHTML = `
        <div class="result">

          Caracteres:
          <b>${text.length}</b>

          <br>

          Palabras:
          <b>
            ${
              text.trim()
                ? text.trim().split(/\s+/).length
                : 0
            }
          </b>

        </div>
      `;

    });

}


/* =========================================================
   DICCIONARIO
========================================================= */

function dictionaryUI() {

  openModal(`
    <h2>📖 Diccionario</h2>

    <div class="form-grid">

      <div class="form-group">
        <label>Palabra</label>
        <input id="dictWord">
      </div>

      <div class="form-group">
        <label>Idioma</label>

        <select id="dictLang">
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>

      </div>

    </div>

    <br>

    <button
      class="form-button"
      id="dictBtn"
    >
      Buscar
    </button>

    <div id="dictResult"></div>
  `);


  document
    .getElementById("dictBtn")
    .addEventListener("click", async () => {

      const word =
        document.getElementById("dictWord")
          .value
          .trim();

      const lang =
        document.getElementById("dictLang")
          .value;

      const result =
        document.getElementById("dictResult");

      if (!word) {
        showToast("Escribe una palabra");
        return;
      }

      result.innerHTML =
        `<div class="result">Buscando...</div>`;

      try {

        const response =
          await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/${lang}/${encodeURIComponent(word)}`
          );

        if (!response.ok) {
          throw new Error();
        }

        const data =
          await response.json();

        const meanings =
          data[0].meanings || [];

        result.innerHTML = `
          <div class="result">

            <h3>${data[0].word}</h3>

            ${meanings.slice(0,4).map(meaning => `
              <p>
                <b>${meaning.partOfSpeech || ""}</b>
              </p>

              ${
                (meaning.definitions || [])
                  .slice(0,3)
                  .map(def => `
                    <p>
                      • ${def.definition}
                    </p>
                  `)
                  .join("")
              }

            `).join("")}

          </div>
        `;

      } catch {

        result.innerHTML = `
          <div class="result">
            No se encontró la palabra o no hay conexión.
          </div>
        `;

      }

    });

}


/* =========================================================
   NOTAS
========================================================= */

function notesUI() {

  openModal(`
    <h2>📝 Notas</h2>

    <div class="form-group">

      <label>
        Nueva nota
      </label>

      <textarea
        id="noteInput"
        placeholder="Escribe una nota..."
      ></textarea>

    </div>

    <br>

    <button
      class="form-button"
      id="noteAdd"
    >
      Guardar nota
    </button>

    <div
      id="notesList"
      class="list"
    ></div>
  `);

  function renderNotes() {

    document.getElementById("notesList").innerHTML =
      state.notes.map((note, index) => `
        <div class="list-item">

          <span style="flex:1">
            ${escapeHTML(note)}
          </span>

          <button
            class="form-button"
            data-delete-note="${index}"
          >
            Eliminar
          </button>

        </div>
      `).join("");


    document
      .querySelectorAll("[data-delete-note]")
      .forEach(button => {

        button.addEventListener("click", () => {

          const index =
            Number(button.dataset.deleteNote);

          state.notes.splice(index,1);

          saveState();

          renderNotes();

        });

      });

  }


  document
    .getElementById("noteAdd")
    .addEventListener("click", () => {

      const input =
        document.getElementById("noteInput");

      const value =
        input.value.trim();

      if (!value) return;

      state.notes.unshift(value);

      saveState();

      input.value = "";

      renderNotes();

      showToast("Nota guardada");

    });


  renderNotes();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   TEMA
========================================================= */

const themeBtn =
  document.getElementById("themeBtn");

function applyTheme() {

  document.body.classList.toggle(
    "light",
    state.theme === "light"
  );

  themeBtn.textContent =
    state.theme === "light"
      ? "☀"
      : "☾";

}

themeBtn.addEventListener("click", () => {

  state.theme =
    state.theme === "dark"
      ? "light"
      : "dark";

  saveState();
  applyTheme();

});


/* =========================================================
   ANIMACIONES
========================================================= */

const animationBtn =
  document.getElementById("animationBtn");

function applyAnimations() {

  document.body.classList.toggle(
    "no-animations",
    !state.animations
  );

  animationBtn.textContent =
    state.animations
      ? "✨ Animaciones: activadas"
      : "✨ Animaciones: desactivadas";

}

animationBtn.addEventListener("click", () => {

  state.animations =
    !state.animations;

  saveState();
  applyAnimations();

});


/* =========================================================
   BOTÓN SORPRÉNDEME
========================================================= */

document
  .getElementById("quickRandom")
  .addEventListener("click", () => {

    const random =
      tools[
        Math.floor(
          Math.random() * tools.length
        )
      ];

    openTool(random.id);

  });


/* =========================================================
   BOTONES DE ORGANIZACIÓN
========================================================= */

document
  .querySelectorAll("[data-tool]")
  .forEach(button => {

    button.addEventListener("click", () => {

      const id =
        button.dataset.tool;

      if (
        tools.some(tool => tool.id === id)
      ) {
        openTool(id);
      }

    });

  });


/* =========================================================
   EXPORTAR DATOS
========================================================= */

document
  .getElementById("exportBtn")
  .addEventListener("click", () => {

    const blob =
      new Blob(
        [
          JSON.stringify(
            state,
            null,
            2
          )
        ],
        {
          type: "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "utilhub-datos.json";

    a.click();

    URL.revokeObjectURL(url);

    showToast("Datos exportados");

  });


/* =========================================================
   IMPORTAR DATOS
========================================================= */

const importFile =
  document.getElementById("importFile");

document
  .getElementById("importBtn")
  .addEventListener("click", () => {

    importFile.click();

  });


importFile.addEventListener("change", event => {

  const file =
    event.target.files[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = () => {

    try {

      const imported =
        JSON.parse(reader.result);

      state = {
        ...defaultState,
        ...imported
      };

      saveState();

      applyTheme();
      applyAnimations();
      renderTools();
      updateStats();

      showToast("Datos importados");

    } catch {

      showToast("Archivo inválido");

    }

  };

  reader.readAsText(file);

});


/* =========================================================
   RESTABLECER
========================================================= */

document
  .getElementById("resetBtn")
  .addEventListener("click", () => {

    const confirmReset =
      confirm(
        "¿Quieres borrar los datos locales de ÚtilHub?"
      );

    if (!confirmReset) return;

    state = {
      ...defaultState
    };

    saveState();

    applyTheme();
    applyAnimations();
    renderTools();
    updateStats();

    showToast("Datos restablecidos");

  });


/* =========================================================
   PWA
========================================================= */

let deferredPrompt = null;

const installBtn =
  document.getElementById("installBtn");

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    installBtn.hidden = false;

  }
);


installBtn.addEventListener("click", async () => {

  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  await deferredPrompt.userChoice;

  deferredPrompt = null;

  installBtn.hidden = true;

});


/* =========================================================
   SERVICE WORKER
========================================================= */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sw.js")
      .catch(() => {});

  });

}


/* =========================================================
   INICIO
========================================================= */

renderFilters();
renderTools();

applyTheme();
applyAnimations();

updateStats();
