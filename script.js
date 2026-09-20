(() => {
  "use strict";

  /* =====================================================
     CONFIGURACIÓN
     ===================================================== */

  const $ = (selector) =>
    document.querySelector(selector);

  const $$ = (selector) =>
    [...document.querySelectorAll(selector)];

  const STORAGE_KEY =
    "utilhub-v14";


  /* =====================================================
     ESTADO
     ===================================================== */

  const defaultState = {

    theme: "dark",

    animations: true,

    favorites: [],

    recent: [],

    notes: "",

    tasks: [],

    shopping: [],

    study: []

  };


  let state =
    loadState();


  let timer = {

    end: 0,

    duration: 0,

    interval: null

  };


  let stopwatch = {

    start: 0,

    elapsed: 0,

    interval: null

  };


  let installPrompt = null;


  /* =====================================================
     HERRAMIENTAS
     ===================================================== */

  const tools = [

    [
      "calculator",
      "🧮",
      "Calculadora",
      "Operaciones rápidas.",
      "Cálculo"
    ],

    [
      "percent",
      "％",
      "Porcentaje",
      "Calcula porcentajes.",
      "Cálculo"
    ],

    [
      "discount",
      "🏷️",
      "Descuento",
      "Precio final y ahorro.",
      "Cálculo"
    ],

    [
      "rule3",
      "📐",
      "Regla de tres",
      "Resuelve proporciones.",
      "Cálculo"
    ],

    [
      "converter",
      "📏",
      "Convertidor",
      "Longitud, peso, volumen y tiempo.",
      "Conversión"
    ],

    [
      "temperature",
      "🌡️",
      "Temperatura",
      "Convierte °C, °F y K.",
      "Conversión"
    ],

    [
      "currency",
      "💱",
      "Monedas",
      "Consulta tasas y convierte.",
      "Conversión"
    ],

    [
      "date",
      "📅",
      "Fechas",
      "Diferencia entre dos fechas.",
      "Tiempo"
    ],

    [
      "age",
      "🎂",
      "Edad",
      "Calcula edad exacta.",
      "Tiempo"
    ],

    [
      "timer",
      "⏱️",
      "Temporizador",
      "Cuenta regresiva.",
      "Tiempo"
    ],

    [
      "stopwatch",
      "⏲️",
      "Cronómetro",
      "Mide tiempo con precisión.",
      "Tiempo"
    ],

    [
      "notes",
      "📝",
      "Notas",
      "Guarda apuntes localmente.",
      "Organiza"
    ],

    [
      "tasks",
      "✅",
      "Tareas",
      "Gestiona pendientes.",
      "Organiza"
    ],

    [
      "shopping",
      "🛒",
      "Compras",
      "Lista de compras.",
      "Organiza"
    ],

    [
      "study",
      "📚",
      "Estudio",
      "Organiza sesiones de estudio.",
      "Organiza"
    ],

    [
      "password",
      "🔐",
      "Contraseñas",
      "Genera claves seguras.",
      "Seguridad"
    ],

    [
      "random",
      "🎲",
      "Aleatorio",
      "Números y dados.",
      "Diversión"
    ],

    [
      "qr",
      "▦",
      "Código QR",
      "Crea un QR desde un texto.",
      "Crear"
    ],

    [
      "text",
      "🔤",
      "Texto",
      "Contador y transformación de texto.",
      "Texto"
    ],

    [
      "dictionary",
      "📖",
      "Diccionario",
      "Consulta palabras en español o inglés.",
      "Texto"
    ]

  ];


  const categories = [
    "Todos",
    ...new Set(
      tools.map(tool => tool[4])
    )
  ];


  let activeCategory =
    "Todos";


  /* =====================================================
     STORAGE
     ===================================================== */

  function loadState() {

    try {

      return {
        ...defaultState,

        ...JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "{}"
        )

      };

    } catch {

      return {
        ...defaultState
      };

    }

  }


  function save() {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    updateStats();

  }


  /* =====================================================
     UTILIDADES
     ===================================================== */

  function toast(message) {

    const element =
      $("#toast");

    element.textContent =
      message;

    element.classList.add(
      "show"
    );

    clearTimeout(
      toast.timer
    );

    toast.timer =
      setTimeout(() => {

        element.classList.remove(
          "show"
        );

      }, 2200);

  }


  function escapeHTML(value) {

    return String(value)
      .replace(
        /[&<>"']/g,
        character => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[character])
      );

  }


  function money(value) {

    return Number(value)
      .toLocaleString(
        "es-PE",
        {
          maximumFractionDigits: 2
        }
      );

  }


  /* =====================================================
     FILTROS
     ===================================================== */

  function renderFilters() {

    $("#filters").innerHTML =
      categories
        .map(category => `

          <button
            class="filter ${
              category === activeCategory
                ? "active"
                : ""
            }"
            data-cat="${escapeHTML(category)}"
          >
            ${escapeHTML(category)}
          </button>

        `)
        .join("");


    $$("#filters .filter")
      .forEach(button => {

        button.onclick = () => {

          activeCategory =
            button.dataset.cat;

          renderTools(
            $("#globalSearch").value
          );

          renderFilters();

        };

      });

  }


  /* =====================================================
     TARJETAS
     ===================================================== */

  function renderTools(query = "") {

    const search =
      query.trim().toLowerCase();


    const visible =
      tools.filter(tool => {

        const categoryOK =
          activeCategory === "Todos" ||
          tool[4] === activeCategory;


        const searchOK =
          !search ||
          tool
            .slice(0, 5)
            .join(" ")
            .toLowerCase()
            .includes(search);


        return categoryOK &&
          searchOK;

      });


    $("#toolGrid").innerHTML =
      visible.length

        ? visible.map(tool => {

            const favorite =
              state.favorites.includes(
                tool[0]
              );


            return `

              <article
                class="tool-card"
              >

                <button
                  class="fav ${
                    favorite ? "on" : ""
                  }"
                  title="Favorito"
                  data-fav="${tool[0]}"
                >
                  ${favorite ? "★" : "☆"}
                </button>

                <div class="tool-icon">
                  ${tool[1]}
                </div>

                <h3>
                  ${escapeHTML(tool[2])}
                </h3>

                <p>
                  ${escapeHTML(tool[3])}
                </p>

                <button
                  class="tool-open"
                  data-tool="${tool[0]}"
                >
                  Abrir
                </button>

              </article>

            `;

          }).join("")

        : `

          <p class="muted">
            No encontramos esa herramienta.
          </p>

        `;


    $$("#toolGrid [data-tool]")
      .forEach(button => {

        button.onclick = () => {

          openTool(
            button.dataset.tool
          );

        };

      });


    $$("#toolGrid [data-fav]")
      .forEach(button => {

        button.onclick = () => {

          toggleFavorite(
            button.dataset.fav
          );

        };

      });

  }


  /* =====================================================
     ESTADÍSTICAS
     ===================================================== */

  function updateStats() {

    $("#toolCount").textContent =
      tools.length;

    $("#favCount").textContent =
      state.favorites.length;

    $("#recentCount").textContent =
      state.recent.length;

    $("#onlineStatus").textContent =
      navigator.onLine
        ? "●"
        : "○";

  }


  /* =====================================================
     FAVORITOS
     ===================================================== */

  function toggleFavorite(id) {

    if (
      state.favorites.includes(id)
    ) {

      state.favorites =
        state.favorites.filter(
          item => item !== id
        );

      toast(
        "Quitado de favoritos"
      );

    } else {

      state.favorites.push(id);

      toast(
        "Añadido a favoritos"
      );

    }


    save();

    renderTools(
      $("#globalSearch").value
    );

  }


  /* =====================================================
     HISTORIAL
     ===================================================== */

  function addRecent(id) {

    state.recent = [
      id,
      ...state.recent.filter(
        item => item !== id
      )
    ].slice(0, 10);


    save();

  }


  /* =====================================================
     MODAL
     ===================================================== */

  function openModal(title, content) {

    $("#modalContent").innerHTML = `

      <h2>
        ${title}
      </h2>

      ${content}

    `;


    $("#modal").hidden =
      false;

  }


  function closeModal() {

    $("#modal").hidden =
      true;

  }


  $$("[data-close]")
    .forEach(element => {

      element.onclick =
        closeModal;

    });


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeModal();

      }

    }
  );


  /* =====================================================
     ABRIR HERRAMIENTA
     ===================================================== */

  function openTool(id) {

    addRecent(id);


    const tool =
      tools.find(
        item => item[0] === id
      );


    if (!tool) {
      return;
    }


    const functions = {

      calculator,
      percent,
      discount,
      rule3,
      converter,
      temperature,
      currency,
      date,
      age,
      timer,
      stopwatch,
      notes,
      tasks,
      shopping,
      study,
      password,
      random,
      qr,
      text,
      dictionary

    };


    if (functions[id]) {

      functions[id]();

    }


    updateStats();

  }


  /* =====================================================
     TARJETAS DE ORGANIZACIÓN
     ===================================================== */

  $$(".action-card")
    .forEach(button => {

      button.onclick = () => {

        openTool(
          button.dataset.tool
        );

      };

    });


  /* =====================================================
     CALCULADORA
     ===================================================== */

  function calculator() {

    openModal(
      "🧮 Calculadora",

      `

      <div class="field">

        <label>
          Expresión
        </label>

        <input
          id="calcIn"
          placeholder="Ej.: (25+15)*2/5"
        >

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="calcGo"
        >
          Calcular
        </button>

      </div>


      <div
        id="calcOut"
        class="result-box"
      >
        Introduce una operación.
      </div>

      `
    );


    $("#calcGo").onclick =
      () => {

        try {

          $("#calcOut")
            .textContent =
            "Resultado: " +
            safeCalculator(
              $("#calcIn").value
            );

        } catch {

          $("#calcOut")
            .textContent =
            "Expresión no válida.";

        }

      };

  }


  function safeCalculator(source) {

    let expression =
      source
        .replace(/\s+/g, "")
        .replace(/,/g, ".");


    if (
      !/^[0-9.+\-*/%()]+$/
        .test(expression) ||
      !expression
    ) {

      throw Error();

    }


    let index = 0;


    function peek() {

      return expression[index];

    }


    function eat(character) {

      if (
        expression[index] ===
        character
      ) {

        index++;

        return true;

      }

      return false;

    }


    function expressionParser() {

      let value =
        term();


      while (
        peek() === "+" ||
        peek() === "-"
      ) {

        const operator =
          expression[index++];

        const right =
          term();


        value =
          operator === "+"
            ? value + right
            : value - right;

      }


      return value;

    }


    function term() {

      let value =
        factor();


      while (
        peek() === "*" ||
        peek() === "/"
      ) {

        const operator =
          expression[index++];

        const right =
          factor();


        if (
          operator === "*"
        ) {

          value *= right;

        } else {

          if (right === 0) {
            throw Error();
          }

          value /= right;

        }

      }


      return value;

    }


    function factor() {

      if (eat("+")) {

        return factor();

      }


      if (eat("-")) {

        return -factor();

      }


      if (eat("(")) {

        const value =
          expressionParser();


        if (!eat(")")) {

          throw Error();

        }


        return value;

      }


      const match =
        expression
          .slice(index)
          .match(
            /^(?:\d+(?:\.\d*)?|\.\d+)/
          );


      if (!match) {

        throw Error();

      }


      index +=
        match[0].length;


      let value =
        Number(match[0]);


      if (eat("%")) {

        value /= 100;

      }


      return value;

    }


    const result =
      expressionParser();


    if (
      index !==
      expression.length ||
      !Number.isFinite(result)
    ) {

      throw Error();

    }


    return Number(
      result.toFixed(10)
    );

  }


  /* =====================================================
     PORCENTAJE
     ===================================================== */

  function percent() {

    openModal(
      "％ Porcentaje",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Porcentaje
          </label>

          <input
            id="p1"
            type="number"
            value="20"
          >

        </div>


        <div class="field">

          <label>
            Número
          </label>

          <input
            id="p2"
            type="number"
            value="150"
          >

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="pgo"
        >
          Calcular
        </button>

      </div>


      <div
        id="pout"
        class="result-box"
      >
        Resultado: 30
      </div>

      `
    );


    $("#pgo").onclick =
      () => {

        const percentage =
          Number(
            $("#p1").value
          );

        const number =
          Number(
            $("#p2").value
          );


        $("#pout")
          .textContent =
          "Resultado: " +
          money(
            percentage *
            number /
            100
          );

      };

  }


  /* =====================================================
     DESCUENTO
     ===================================================== */

  function discount() {

    openModal(
      "🏷️ Descuento",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Precio
          </label>

          <input
            id="d1"
            type="number"
            value="100"
          >

        </div>


        <div class="field">

          <label>
            Descuento %
          </label>

          <input
            id="d2"
            type="number"
            value="20"
          >

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="dgo"
        >
          Calcular
        </button>

      </div>


      <div
        id="dout"
        class="result-box"
      ></div>

      `
    );


    $("#dgo").onclick =
      () => {

        const price =
          Number(
            $("#d1").value
          );

        const discountValue =
          Number(
            $("#d2").value
          );


        const saving =
          price *
          discountValue /
          100;


        $("#dout")
          .textContent =
          `Ahorras: ${money(saving)} · Precio final: ${money(price - saving)}`;

      };

  }


  /* =====================================================
     REGLA DE TRES
     ===================================================== */

  function rule3() {

    openModal(
      "📐 Regla de tres",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            A
          </label>

          <input
            id="r1"
            type="number"
            value="4"
          >

        </div>


        <div class="field">

          <label>
            B
          </label>

          <input
            id="r2"
            type="number"
            value="12"
          >

        </div>


        <div class="field">

          <label>
            C
          </label>

          <input
            id="r3"
            type="number"
            value="7"
          >

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="rgo"
        >
          Resolver
        </button>

      </div>


      <div
        id="rout"
        class="result-box"
      >
        x = C × B ÷ A
      </div>

      `
    );


    $("#rgo").onclick =
      () => {

        const a =
          Number(
            $("#r1").value
          );

        const b =
          Number(
            $("#r2").value
          );

        const c =
          Number(
            $("#r3").value
          );


        if (a === 0) {

          $("#rout")
            .textContent =
            "A no puede ser 0.";

          return;

        }


        $("#rout")
          .textContent =
          "x = " +
          money(
            c * b / a
          );

      };

  }


  /* =====================================================
     CONVERSOR
     ===================================================== */

  function converter() {

    openModal(
      "📏 Convertidor",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Tipo
          </label>

          <select id="ct">

            <option value="length">
              Longitud
            </option>

            <option value="weight">
              Peso
            </option>

            <option value="volume">
              Volumen
            </option>

            <option value="time">
              Tiempo
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Valor
          </label>

          <input
            id="cv"
            type="number"
            value="1"
          >

        </div>


        <div class="field">

          <label>
            De
          </label>

          <select id="cf"></select>

        </div>


        <div class="field">

          <label>
            A
          </label>

          <select id="cto"></select>

        </div>

      </div>


      <div
        id="cout"
        class="result-box"
      ></div>

      `
    );


    const maps = {

      length: {

        values: {
          m: 1,
          km: 1000,
          cm: 0.01,
          mm: 0.001,
          ft: 0.3048,
          in: 0.0254
        },

        names: {
          m: "metros",
          km: "kilómetros",
          cm: "centímetros",
          mm: "milímetros",
          ft: "pies",
          in: "pulgadas"
        }

      },


      weight: {

        values: {
          kg: 1,
          g: 0.001,
          lb: 0.453592,
          oz: 0.0283495
        },

        names: {
          kg: "kg",
          g: "g",
          lb: "libras",
          oz: "oz"
        }

      },


      volume: {

        values: {
          l: 1,
          ml: 0.001,
          m3: 1000,
          gal: 3.78541
        },

        names: {
          l: "litros",
          ml: "mililitros",
          m3: "m³",
          gal: "galones"
        }

      },


      time: {

        values: {
          s: 1,
          min: 60,
          h: 3600,
          day: 86400
        },

        names: {
          s: "segundos",
          min: "minutos",
          h: "horas",
          day: "días"
        }

      }

    };


    function fillUnits() {

      const map =
        maps[
          $("#ct").value
        ];


      const options =
        Object.keys(
          map.values
        )
        .map(
          key =>
            `<option value="${key}">
              ${map.names[key]}
            </option>`
        )
        .join("");


      $("#cf").innerHTML =
        options;

      $("#cto").innerHTML =
        options;


      calculate();

    }


    function calculate() {

      const map =
        maps[
          $("#ct").value
        ];


      const from =
        $("#cf").value;

      const to =
        $("#cto").value;

      const value =
        Number(
          $("#cv").value
        );


      const result =
        value *
        map.values[from] /
        map.values[to];


      $("#cout")
        .textContent =
        `Resultado: ${money(result)} ${map.names[to]}`;

    }


    $("#ct").onchange =
      fillUnits;

    $("#cv").oninput =
      calculate;

    $("#cf").oninput =
      calculate;

    $("#cto").oninput =
      calculate;


    fillUnits();

  }


  /* =====================================================
     TEMPERATURA
     ===================================================== */

  function temperature() {

    openModal(
      "🌡️ Temperatura",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Valor
          </label>

          <input
            id="tv"
            type="number"
            value="25"
          >

        </div>


        <div class="field">

          <label>
            De
          </label>

          <select id="tf">

            <option>°C</option>
            <option>°F</option>
            <option>K</option>

          </select>

        </div>


        <div class="field">

          <label>
            A
          </label>

          <select id="tt">

            <option>°F</option>
            <option>°C</option>
            <option>K</option>

          </select>

        </div>

      </div>


      <div
        id="tout"
        class="result-box"
      ></div>

      `
    );


    function calculate() {

      const value =
        Number(
          $("#tv").value
        );

      const from =
        $("#tf").value;

      const to =
        $("#tt").value;


      let celsius;


      if (from === "°C") {

        celsius =
          value;

      } else if (from === "°F") {

        celsius =
          (value - 32) *
          5 / 9;

      } else {

        celsius =
          value - 273.15;

      }


      let result;


      if (to === "°C") {

        result =
          celsius;

      } else if (to === "°F") {

        result =
          celsius *
          9 / 5 +
          32;

      } else {

        result =
          celsius +
          273.15;

      }


      $("#tout")
        .textContent =
        `Resultado: ${money(result)} ${to}`;

    }


    $("#tv").oninput =
      calculate;

    $("#tf").oninput =
      calculate;

    $("#tt").oninput =
      calculate;


    calculate();

  }


  /* =====================================================
     MONEDAS
     ===================================================== */

  async function currency() {

    openModal(
      "💱 Monedas",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Cantidad
          </label>

          <input
            id="mv"
            type="number"
            value="100"
          >

        </div>


        <div class="field">

          <label>
            De
          </label>

          <select id="mf">

            <option>PEN</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>

          </select>

        </div>


        <div class="field">

          <label>
            A
          </label>

          <select id="mt">

            <option>USD</option>
            <option>PEN</option>
            <option>EUR</option>
            <option>GBP</option>

          </select>

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="mgo"
        >
          Consultar tasa
        </button>

      </div>


      <div
        id="mout"
        class="result-box"
      >
        Se necesita conexión para consultar
        una tasa actualizada.
      </div>

      `
    );


    $("#mgo").onclick =
      async () => {

        const from =
          $("#mf").value;

        const to =
          $("#mt").value;

        const value =
          Number(
            $("#mv").value
          );


        try {

          const response =
            await fetch(
              `https://open.er-api.com/v6/latest/${from}`
            );


          const data =
            await response.json();


          if (
            data.result !==
            "success"
          ) {

            throw Error();

          }


          localStorage.setItem(
            "utilhub-rate-" + from,

            JSON.stringify({
              time: Date.now(),
              rates: data.rates
            })
          );


          $("#mout")
            .textContent =
            `${money(value)} ${from} ≈ ${money(value * data.rates[to])} ${to}`;

        } catch {

          try {

            const cached =
              JSON.parse(
                localStorage.getItem(
                  "utilhub-rate-" + from
                )
              );


            if (
              !cached ||
              !cached.rates ||
              !cached.rates[to]
            ) {

              throw Error();

            }


            $("#mout")
              .textContent =
              `Última tasa guardada: ${money(value * cached.rates[to])} ${to}`;

          } catch {

            $("#mout")
              .textContent =
              "No fue posible consultar ni recuperar una tasa guardada.";

          }

        }

      };

  }


  /* =====================================================
     FECHAS
     ===================================================== */

  function date() {

    openModal(
      "📅 Diferencia de fechas",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Fecha inicial
          </label>

          <input
            id="da"
            type="date"
          >

        </div>


        <div class="field">

          <label>
            Fecha final
          </label>

          <input
            id="db"
            type="date"
          >

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="dago"
        >
          Calcular
        </button>

      </div>


      <div
        id="daout"
        class="result-box"
      ></div>

      `
    );


    const today =
      new Date();


    $("#da")
      .valueAsDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );


    $("#db")
      .valueAsDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );


    $("#dago").onclick =
      () => {

        const first =
          new Date(
            $("#da").value +
            "T00:00:00"
          );

        const second =
          new Date(
            $("#db").value +
            "T00:00:00"
          );


        const days =
          Math.round(
            Math.abs(
              second - first
            ) /
            86400000
          );


        $("#daout")
          .textContent =
          `Diferencia: ${days} día(s)`;

      };

  }


  /* =====================================================
     EDAD
     ===================================================== */

  function age() {

    openModal(
      "🎂 Edad",

      `

      <div class="field">

        <label>
          Fecha de nacimiento
        </label>

        <input
          id="birth"
          type="date"
        >

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="agego"
        >
          Calcular
        </button>

      </div>


      <div
        id="ageout"
        class="result-box"
      ></div>

      `
    );


    $("#agego").onclick =
      () => {

        const birth =
          new Date(
            $("#birth").value +
            "T00:00:00"
          );


        const now =
          new Date();


        if (
          Number.isNaN(
            birth.getTime()
          )
        ) {

          return;

        }


        let years =
          now.getFullYear() -
          birth.getFullYear();


        const month =
          now.getMonth() -
          birth.getMonth();


        if (
          month < 0 ||
          (
            month === 0 &&
            now.getDate() <
            birth.getDate()
          )
        ) {

          years--;

        }


        $("#ageout")
          .textContent =
          `Edad: ${years} años`;

      };

  }


  /* =====================================================
     TEMPORIZADOR
     ===================================================== */

  function timerTool() {

    openModal(
      "⏱️ Temporizador",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Minutos
          </label>

          <input
            id="tm"
            type="number"
            min="0"
            value="1"
          >

        </div>


        <div class="field">

          <label>
            Segundos
          </label>

          <input
            id="ts"
            type="number"
            min="0"
            value="0"
          >

        </div>

      </div>


      <div
        id="tmout"
        class="result-box"
      >
        00:00
      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="tmstart"
        >
          Iniciar
        </button>

        <button
          class="secondary"
          id="tmstop"
        >
          Detener
        </button>

      </div>

      `
    );


    const output =
      $("#tmout");


    function draw() {

      const remaining =
        Math.max(
          0,
          timer.end -
          Date.now()
        );


      const seconds =
        Math.ceil(
          remaining /
          1000
        );


      output.textContent =
        `${String(
          Math.floor(
            seconds / 60
          )
        ).padStart(2, "0")}:${String(
          seconds % 60
        ).padStart(2, "0")}`;


      if (
        remaining <= 0
      ) {

        clearInterval(
          timer.interval
        );

        toast(
          "Temporizador terminado"
        );

      }

    }


    $("#tmstart").onclick =
      () => {

        const duration =
          (
            Number(
              $("#tm").value
            ) *
            60 +
            Number(
              $("#ts").value
            )
          ) *
          1000;


        if (
          duration <= 0
        ) {

          return;

        }


        timer.duration =
          duration;


        timer.end =
          Date.now() +
          duration;


        clearInterval(
          timer.interval
        );


        timer.interval =
          setInterval(
            draw,
            200
          );


        draw();

      };


    $("#tmstop").onclick =
      () => {

        clearInterval(
          timer.interval
        );

      };

  }


  /* =====================================================
     CRONÓMETRO
     ===================================================== */

  function stopwatchTool() {

    openModal(
      "⏲️ Cronómetro",

      `

      <div
        id="swout"
        class="result-box"
      >
        00:00.00
      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="swstart"
        >
          Iniciar
        </button>

        <button
          class="secondary"
          id="swlap"
        >
          Pausa
        </button>

        <button
          class="secondary"
          id="swreset"
        >
          Reiniciar
        </button>

      </div>

      `
    );


    const output =
      $("#swout");


    function draw() {

      const milliseconds =
        stopwatch.elapsed +
        (
          stopwatch.start
            ? Date.now() -
              stopwatch.start
            : 0
        );


      output.textContent =
        `${String(
          Math.floor(
            milliseconds / 60000
          )
        ).padStart(2, "0")}:${String(
          Math.floor(
            milliseconds / 1000
          ) % 60
        ).padStart(2, "0")}.${String(
          Math.floor(
            milliseconds / 10
          ) % 100
        ).padStart(2, "0")}`;

    }


    $("#swstart").onclick =
      () => {

        if (
          !stopwatch.start
        ) {

          stopwatch.start =
            Date.now();


          stopwatch.interval =
            setInterval(
              draw,
              50
            );

        }

      };


    $("#swlap").onclick =
      () => {

        if (
          stopwatch.start
        ) {

          stopwatch.elapsed +=
            Date.now() -
            stopwatch.start;


          stopwatch.start =
            0;


          clearInterval(
            stopwatch.interval
          );

        }

      };


    $("#swreset").onclick =
      () => {

        stopwatch.start =
          0;

        stopwatch.elapsed =
          0;

        clearInterval(
          stopwatch.interval
        );

        draw();

      };

  }


  /* =====================================================
     NOTAS
     ===================================================== */

  function notes() {

    openModal(
      "📝 Notas",

      `

      <div class="field">

        <label>
          Tu nota
        </label>

        <textarea
          id="noteIn"
          placeholder="Escribe aquí..."
        >${escapeHTML(
          state.notes
        )}</textarea>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="noteSave"
        >
          Guardar
        </button>

      </div>

      `
    );


    $("#noteSave").onclick =
      () => {

        state.notes =
          $("#noteIn").value;

        save();

        toast(
          "Nota guardada"
        );

      };

  }


  /* =====================================================
     LISTAS
     ===================================================== */

  function listTool(
    type,
    title,
    emoji,
    placeholder
  ) {

    openModal(
      `${emoji} ${title}`,

      `

      <div class="form-grid">

        <div class="field full">

          <label>
            Nuevo elemento
          </label>

          <input
            id="liIn"
            placeholder="${placeholder}"
          >

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="liAdd"
        >
          Agregar
        </button>

      </div>


      <div
        id="liList"
        class="list"
      ></div>

      `
    );


    const array =
      state[type];

    const list =
      $("#liList");


    function draw() {

      list.innerHTML =
        array.length

          ? array
              .map(
                (item, index) => `

                  <div
                    class="list-item"
                  >

                    <span>
                      ${escapeHTML(item)}
                    </span>

                    <button
                      class="secondary"
                      data-del="${index}"
                    >
                      Eliminar
                    </button>

                  </div>

                `
              )
              .join("")

          : `
              <p class="muted">
                Lista vacía.
              </p>
            `;


      $$("#liList [data-del]")
        .forEach(button => {

          button.onclick =
            () => {

              array.splice(
                Number(
                  button.dataset.del
                ),
                1
              );


              save();

              draw();

            };

        });

    }


    $("#liAdd").onclick =
      () => {

        const value =
          $("#liIn")
            .value
            .trim();


        if (!value) {
          return;
        }


        array.push(
          value
        );


        $("#liIn")
          .value = "";


        save();

        draw();

      };


    draw();

  }


  function tasks() {

    listTool(
      "tasks",
      "Tareas",
      "✅",
      "Ej.: terminar proyecto"
    );

  }


  function shopping() {

    listTool(
      "shopping",
      "Compras",
      "🛒",
      "Ej.: arroz"
    );

  }


  function study() {

    listTool(
      "study",
      "Estudio",
      "📚",
      "Ej.: repasar ciencias"
    );

  }


  /* =====================================================
     CONTRASEÑAS
     ===================================================== */

  function password() {

    openModal(
      "🔐 Generador de contraseñas",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Longitud
          </label>

          <input
            id="pl"
            type="number"
            min="6"
            max="128"
            value="18"
          >

        </div>


        <div class="field">

          <label>
            Opciones
          </label>

          <select id="ps">

            <option value="all">
              Letras + números + símbolos
            </option>

            <option value="alnum">
              Letras + números
            </option>

            <option value="letters">
              Solo letras
            </option>

          </select>

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="pgen"
        >
          Generar
        </button>

        <button
          class="secondary"
          id="pcopy"
        >
          Copiar
        </button>

      </div>


      <div
        id="pout"
        class="result-box"
      ></div>

      `
    );


    function generate() {

      const sets = {

        all:
          "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-",

        alnum:
          "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",

        letters:
          "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

      };


      const characters =
        sets[
          $("#ps").value
        ];


      const length =
        Math.min(
          128,
          Math.max(
            6,
            Number(
              $("#pl").value
            ) || 18
          )
        );


      const randomValues =
        new Uint32Array(
          length
        );


      crypto.getRandomValues(
        randomValues
      );


      const passwordValue =
        Array
          .from(
            randomValues,
            number =>
              characters[
                number %
                characters.length
              ]
          )
          .join("");


      $("#pout")
        .textContent =
        passwordValue;

    }


    $("#pgen").onclick =
      generate;


    $("#pcopy").onclick =
      () => {

        navigator.clipboard
          ?.writeText(
            $("#pout").textContent
          )
          .then(
            () =>
              toast(
                "Contraseña copiada"
              )
          );

      };


    generate();

  }


  /* =====================================================
     ALEATORIO
     ===================================================== */

  function randomTool() {

    openModal(
      "🎲 Aleatorio",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Mínimo
          </label>

          <input
            id="rn1"
            type="number"
            value="1"
          >

        </div>


        <div class="field">

          <label>
            Máximo
          </label>

          <input
            id="rn2"
            type="number"
            value="100"
          >

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="rngo"
        >
          Número aleatorio
        </button>

        <button
          class="secondary"
          id="dicego"
        >
          🎲 Dado
        </button>

      </div>


      <div
        id="rnout"
        class="result-box"
      ></div>

      `
    );


    $("#rngo").onclick =
      () => {

        let min =
          Number(
            $("#rn1").value
          );

        let max =
          Number(
            $("#rn2").value
          );


        if (
          min > max
        ) {

          [
            min,
            max
          ] = [
            max,
            min
          ];

        }


        const result =
          Math.floor(
            Math.random() *
            (
              max -
              min +
              1
            )
          ) +
          min;


        $("#rnout")
          .textContent =
          result;

      };


    $("#dicego").onclick =
      () => {

        $("#rnout")
          .textContent =
          Math.floor(
            Math.random() * 6
          ) + 1;

      };

  }


  /* =====================================================
     QR
     ===================================================== */

  function qr() {

    openModal(
      "▦ Código QR",

      `

      <div class="field">

        <label>
          Texto o enlace
        </label>

        <input
          id="qrIn"
          placeholder="https://ejemplo.com"
        >

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="qrgo"
        >
          Crear QR
        </button>

      </div>


      <div
        id="qrout"
        class="result-box"
      >
        El QR se genera mediante un servicio
        externo y necesita internet.
      </div>

      `
    );


    $("#qrgo").onclick =
      () => {

        const value =
          $("#qrIn")
            .value
            .trim();


        if (!value) {
          return;
        }


        $("#qrout")
          .innerHTML = `

            <img
              style="
                max-width:260px;
                width:100%;
                display:block;
                margin:auto;
                border-radius:12px;
              "
              alt="Código QR"
              src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(value)}"
            >

          `;

      };

  }


  /* =====================================================
     TEXTO
     ===================================================== */

  function text() {

    openModal(
      "🔤 Herramientas de texto",

      `

      <div class="field">

        <label>
          Texto
        </label>

        <textarea
          id="tx"
        ></textarea>

      </div>


      <div class="modal-actions">

        <button
          class="secondary"
          id="upper"
        >
          MAYÚSCULAS
        </button>

        <button
          class="secondary"
          id="lower"
        >
          minúsculas
        </button>

        <button
          class="secondary"
          id="copytx"
        >
          Copiar
        </button>

      </div>


      <div
        id="txout"
        class="result-box"
      >
        Caracteres: 0 · Palabras: 0 · Líneas: 0
      </div>

      `
    );


    function statistics() {

      const value =
        $("#tx").value;


      const words =
        value.trim()
          ? value
              .trim()
              .split(/\s+/)
              .length
          : 0;


      const lines =
        value
          ? value.split("\n").length
          : 0;


      $("#txout")
        .textContent =
        `Caracteres: ${value.length} · Palabras: ${words} · Líneas: ${lines}`;

    }


    $("#tx").oninput =
      statistics;


    $("#upper").onclick =
      () => {

        $("#tx").value =
          $("#tx")
            .value
            .toUpperCase();

        statistics();

      };


    $("#lower").onclick =
      () => {

        $("#tx").value =
          $("#tx")
            .value
            .toLowerCase();

        statistics();

      };


    $("#copytx").onclick =
      () => {

        navigator.clipboard
          ?.writeText(
            $("#tx").value
          )
          .then(
            () =>
              toast(
                "Texto copiado"
              )
          );

      };

  }


  /* =====================================================
     DICCIONARIO
     ===================================================== */

  async function dictionary() {

    openModal(
      "📖 Diccionario",

      `

      <div class="form-grid">

        <div class="field">

          <label>
            Idioma
          </label>

          <select id="dictLang">

            <option value="es">
              Español
            </option>

            <option value="en">
              Inglés
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Palabra
          </label>

          <input
            id="dictWord"
            placeholder="Escribe una palabra"
          >

        </div>

      </div>


      <div class="modal-actions">

        <button
          class="primary"
          id="dictGo"
        >
          Buscar
        </button>

      </div>


      <div
        id="dictOut"
        class="result-box"
      >
        Consulta un diccionario público.
        Necesita internet.
      </div>

      `
    );


    $("#dictGo").onclick =
      async () => {

        const language =
          $("#dictLang").value;

        const word =
          $("#dictWord")
            .value
            .trim();


        if (!word) {
          return;
        }


        $("#dictOut")
          .textContent =
          "Buscando...";


        try {

          const response =
            await fetch(
              `https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word)}`
            );


          const data =
            await response.json();


          if (
            !Array.isArray(data)
          ) {

            throw Error();

          }


          const meanings =
            data[0]
              .meanings || [];


          const definitions =
            meanings
              .slice(0, 3)
              .map(
                meaning => `

                  <b>
                    ${escapeHTML(
                      meaning.partOfSpeech ||
                      ""
                    )}
                  </b>

                  :

                  ${escapeHTML(
                    meaning
                      .definitions?.[0]
                      ?.definition ||
                    ""
                  )}

                `
              )
              .join("<br><br>");


          $("#dictOut")
            .innerHTML =
            definitions ||
            "Sin definición.";

        } catch {

          $("#dictOut")
            .textContent =
            "No se encontró la palabra o no hay conexión.";

        }

      };

  }


  /* =====================================================
     BÚSQUEDA GLOBAL
     ===================================================== */

  $("#globalSearch")
    .addEventListener(
      "input",
      event => {

        const query =
          event.target.value;


        renderTools(
          query
        );


        const search =
          query
            .trim()
            .toLowerCase();


        $("#searchResults")
          .innerHTML =
          search

            ? tools
                .filter(
                  tool =>
                    tool
                      .slice(0, 5)
                      .join(" ")
                      .toLowerCase()
                      .includes(search)
                )
                .slice(0, 6)
                .map(
                  tool => `

                    <button
                      data-search-tool="${tool[0]}"
                    >
                      ${tool[1]}
                      ${escapeHTML(tool[2])}
                      —
                      ${escapeHTML(tool[3])}
                    </button>

                  `
                )
                .join("")

            : "";


        $$("#searchResults [data-search-tool]")
          .forEach(button => {

            button.onclick =
              () => {

                openTool(
                  button.dataset.searchTool
                );

              };

          });

      }
    );


  /* =====================================================
     TEMA
     ===================================================== */

  $("#themeBtn").onclick =
    () => {

      state.theme =
        state.theme === "dark"
          ? "light"
          : "dark";


      applyPreferences();

      save();

    };


  /* =====================================================
     ANIMACIONES
     ===================================================== */

  $("#animationBtn").onclick =
    () => {

      state.animations =
        !state.animations;


      applyPreferences();

      save();

    };


  /* =====================================================
     SORPRÉNDEME
     ===================================================== */

  $("#quickRandom").onclick =
    () => {

      openTool(
        "random"
      );

    };


  /* =====================================================
     EXPORTAR
     ===================================================== */

  $("#exportBtn").onclick =
    () => {

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
            type:
              "application/json"
          }
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        URL.createObjectURL(
          blob
        );


      link.download =
        "utilhub-v14-datos.json";


      link.click();


      URL.revokeObjectURL(
        link.href
      );

    };


  /* =====================================================
     IMPORTAR
     ===================================================== */

  $("#importBtn").onclick =
    () => {

      $("#importFile").click();

    };


  $("#importFile")
    .onchange =
    async event => {

      try {

        const file =
          event.target.files[0];


        if (!file) {
          return;
        }


        const imported =
          JSON.parse(
            await file.text()
          );


        state = {
          ...defaultState,
          ...imported
        };


        save();

        applyPreferences();

        renderTools();

        toast(
          "Datos importados"
        );

      } catch {

        toast(
          "Archivo no válido"
        );

      }

    };


  /* =====================================================
     RESTABLECER
     ===================================================== */

  $("#resetBtn").onclick =
    () => {

      if (
        confirm(
          "¿Borrar los datos locales de ÚtilHub?"
        )
      ) {

        localStorage.removeItem(
          STORAGE_KEY
        );


        state = {
          ...defaultState
        };


        applyPreferences();

        renderTools();

        save();

        toast(
          "Datos restablecidos"
        );

      }

    };


  /* =====================================================
     PREFERENCIAS
     ===================================================== */

  function applyPreferences() {

    document.body.classList.toggle(
      "light",
      state.theme === "light"
    );


    document.body.classList.toggle(
      "no-animation",
      !state.animations
    );


    $("#themeBtn")
      .textContent =
      state.theme === "dark"
        ? "☾"
        : "☀";


    $("#animationBtn")
      .textContent =
      `✨ Animaciones: ${
        state.animations
          ? "activadas"
          : "desactivadas"
      }`;

  }


  /* =====================================================
     CONEXIÓN
     ===================================================== */

  window.addEventListener(
    "online",
    updateStats
  );


  window.addEventListener(
    "offline",
    updateStats
  );


  /* =====================================================
     INSTALACIÓN PWA
     ===================================================== */

  window.addEventListener(
    "beforeinstallprompt",
    event => {

      event.preventDefault();

      installPrompt =
        event;

      $("#installBtn")
        .hidden =
        false;

    }
  );


  $("#installBtn").onclick =
    async () => {

      if (!installPrompt) {
        return;
      }


      installPrompt.prompt();


      await installPrompt
        .userChoice;


      installPrompt =
        null;


      $("#installBtn")
        .hidden =
        true;

    };


  /* =====================================================
     SERVICE WORKER
     ===================================================== */

  if (
    "serviceWorker" in
    navigator
  ) {

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register(
            "./sw.js"
          )
          .catch(
            () => {}
          );

      }
    );

  }


  /* =====================================================
     INICIALIZACIÓN
     ===================================================== */

  renderFilters();

  renderTools();

  applyPreferences();

  updateStats();

})();
